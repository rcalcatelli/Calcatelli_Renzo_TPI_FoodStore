from typing import Callable

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"
CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(access_token: str | None = Cookie(default=None, include_in_schema=False)) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly, valida firma y vencimiento y carga el usuario."""
    no_autenticado = HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado o sesión vencida")
    if not access_token:
        raise no_autenticado
    username = decode_access_token(access_token)
    if username is None:
        raise no_autenticado
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise no_autenticado
        return UserPublic.model_validate(usuario)


def get_current_active_user(usuario: UserPublic = Depends(get_current_user)) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    """Dependencia que deja pasar solo a los roles indicados (403 si no corresponde)."""

    def verificar_rol(usuario: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permiso para realizar esta acción")
        return usuario

    return verificar_rol

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import MensajeRespuesta
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UserCreate, svc: AuthService = Depends(get_auth_service)):
    return svc.registrar(data)


@router.post("/token", response_model=MensajeRespuesta)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    svc: AuthService = Depends(get_auth_service),
):
    token = svc.login(form.username, form.password)
    # El token viaja solo en la cookie HttpOnly: el cuerpo no lo incluye
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # en producción (HTTPS) va en True
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", path="/")
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def perfil(usuario: UserPublic = Depends(get_current_active_user)):
    return usuario

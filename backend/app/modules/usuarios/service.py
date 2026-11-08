from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


# ── Excepciones de dominio (el Router las traduce a HTTP) ─────────────────────


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"Usuario con id {usuario_id} no encontrado")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("Un administrador no puede desactivarse a sí mismo")


class UsuarioService:
    """Gestión de usuarios para el rol admin: listado, activación y desactivación."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_disabled(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacion()
        return self._cambiar_disabled(usuario_id, disabled=True)

    def _cambiar_disabled(self, usuario_id: int, disabled: bool) -> UserPublic:
        # Idempotente: responde 200 aunque el estado ya fuera el pedido
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(usuario_id)
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import require_role

from .schemas import UserPublic
from .service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

solo_admin = require_role(["admin"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic], dependencies=[Depends(solo_admin)])
def listar_usuarios(svc: UsuarioService = Depends(get_usuario_service)):
    return svc.listar()


@router.post("/{id}/activar", response_model=UserPublic, dependencies=[Depends(solo_admin)])
def activar_usuario(id: int = Path(gt=0), svc: UsuarioService = Depends(get_usuario_service)):
    try:
        return svc.activar(id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int = Path(gt=0),
    admin: UserPublic = Depends(solo_admin),
    svc: UsuarioService = Depends(get_usuario_service),
):
    try:
        return svc.desactivar(id, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

from .models import EstadoPedido
from .schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import PedidoAjeno, PedidoNoEncontrado, PedidoService, ReglaDeNegocio
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: UserPublic = Depends(get_current_active_user),
    svc: PedidoService = Depends(get_pedido_service),
):
    try:
        return svc.crear(data, usuario)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = Query(None),
    usuario: UserPublic = Depends(get_current_active_user),
    svc: PedidoService = Depends(get_pedido_service),
):
    """Propios (user) o todos (admin)."""
    return svc.listar(usuario, skip, limit, estado)


# Se declara antes de /{id} para que "resumen" no se interprete como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=[Depends(require_role(["admin"]))])
def resumen_pedidos(svc: PedidoService = Depends(get_pedido_service)):
    return svc.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: int = Path(gt=0),
    usuario: UserPublic = Depends(get_current_active_user),
    svc: PedidoService = Depends(get_pedido_service),
):
    try:
        return svc.obtener(id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e))


@router.patch("/{id}/estado", response_model=PedidoRead, dependencies=[Depends(require_role(["admin"]))])
def cambiar_estado_pedido(
    data: CambioEstado, id: int = Path(gt=0), svc: PedidoService = Depends(get_pedido_service)
):
    try:
        return svc.cambiar_estado(id, data)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int = Path(gt=0),
    usuario: UserPublic = Depends(get_current_active_user),
    svc: PedidoService = Depends(get_pedido_service),
):
    try:
        return svc.cancelar(id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))

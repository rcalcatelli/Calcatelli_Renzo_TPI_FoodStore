from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada

from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])

solo_admin = [Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100, description="Busca en el nombre, sin distinguir mayúsculas"),
    categoria_id: Optional[int] = Query(None, gt=0),
    disponible: Optional[bool] = Query(None),
    svc: ProductoService = Depends(get_producto_service),
):
    return svc.listar(skip, limit, search.strip() if search else None, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(id: int = Path(gt=0), svc: ProductoService = Depends(get_producto_service)):
    try:
        return svc.obtener(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin)
def crear_producto(data: ProductoCreate, svc: ProductoService = Depends(get_producto_service)):
    try:
        return svc.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.put("/{id}", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_producto(
    data: ProductoUpdate, id: int = Path(gt=0), svc: ProductoService = Depends(get_producto_service)
):
    try:
        return svc.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.patch("/{id}/stock", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_stock(
    data: ProductoStockUpdate, id: int = Path(gt=0), svc: ProductoService = Depends(get_producto_service)
):
    try:
        return svc.actualizar_stock(id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_producto(id: int = Path(gt=0), svc: ProductoService = Depends(get_producto_service)):
    try:
        svc.eliminar(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)

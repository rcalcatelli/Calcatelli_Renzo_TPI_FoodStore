from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import require_role

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])

solo_admin = [Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(svc: CategoriaService = Depends(get_categoria_service)):
    return svc.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(id: int = Path(gt=0), svc: CategoriaService = Depends(get_categoria_service)):
    try:
        return svc.obtener(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin)
def crear_categoria(data: CategoriaCreate, svc: CategoriaService = Depends(get_categoria_service)):
    try:
        return svc.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.put("/{id}", response_model=CategoriaRead, dependencies=solo_admin)
def actualizar_categoria(
    data: CategoriaUpdate, id: int = Path(gt=0), svc: CategoriaService = Depends(get_categoria_service)
):
    try:
        return svc.actualizar(id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_categoria(id: int = Path(gt=0), svc: CategoriaService = Depends(get_categoria_service)):
    try:
        svc.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)

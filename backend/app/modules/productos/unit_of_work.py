from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository

from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Productos y categorías sobre la misma sesión (se valida la categoría al crear o editar)."""

    productos: ProductoRepository
    categorias: CategoriaRepository

    def _crear_repositorios(self, session: Session) -> None:
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)

from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork

from .repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository

    def _crear_repositorios(self, session: Session) -> None:
        self.categorias = CategoriaRepository(session)

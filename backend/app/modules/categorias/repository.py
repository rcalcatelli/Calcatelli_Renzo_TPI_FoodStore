from sqlalchemy import func
from sqlmodel import col, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_activa(self, categoria_id: int) -> Categoria | None:
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def listar_activas(self) -> list[Categoria]:
        return list(
            self.session.exec(select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.id)).all()
        )

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Sin distinguir mayúsculas y entre todas, también las dadas de baja:
        la baja lógica no libera el nombre."""
        return self.session.exec(select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())).first()

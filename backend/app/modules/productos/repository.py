from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import col, select

from app.core.base_repository import BaseRepository

from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_activo(self, producto_id: int) -> Producto | None:
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def get_para_actualizar(self, producto_id: int) -> Producto | None:
        """Bloquea la fila (SELECT ... FOR UPDATE) para que dos pedidos simultáneos
        no descuenten el mismo stock. SQLite ignora el bloqueo."""
        return self.session.get(Producto, producto_id, with_for_update=True)

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Productos activos filtrados. Devuelve (total sin paginar, página pedida)."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        items = self.session.exec(
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        ).all()
        return total, list(items)

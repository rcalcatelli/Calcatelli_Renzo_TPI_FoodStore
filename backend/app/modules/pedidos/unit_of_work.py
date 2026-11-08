from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository

from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos sobre la misma sesión: el pedido, sus líneas y el
    movimiento de stock se confirman (o se descartan) juntos."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _crear_repositorios(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)

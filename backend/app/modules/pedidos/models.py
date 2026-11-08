from datetime import datetime, timezone
from enum import StrEnum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class EstadoPedido(StrEnum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(StrEnum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


class Pedido(SQLModel, table=True):
    """total = Σ DetallePedido.subtotal; fijo desde la creación (RN-05). No se borra: se cancela."""

    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True, nullable=False)
    estado: str = Field(default=EstadoPedido.PENDIENTE, max_length=20, index=True, nullable=False)
    forma_pago: str = Field(max_length=20, nullable=False)
    direccion_entrega: str = Field(max_length=200, nullable=False)
    notas: Optional[str] = Field(default=None, sa_type=Text)
    total: float = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True), nullable=False)
    updated_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True), nullable=False)

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    # Composición: las líneas pertenecen al pedido
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "DetallePedido.id"},
    )


class DetallePedido(SQLModel, table=True):
    """Línea inmutable (RN-05): nombre_producto y precio_unitario se copian del producto.
    subtotal = precio_unitario × cantidad. Un producto no se repite en el pedido (RN-01)."""

    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True, nullable=False)
    producto_id: int = Field(foreign_key="productos.id", index=True, nullable=False)
    cantidad: int = Field(nullable=False)
    nombre_producto: str = Field(max_length=150, nullable=False)
    precio_unitario: float = Field(nullable=False)
    subtotal: float = Field(nullable=False)

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")

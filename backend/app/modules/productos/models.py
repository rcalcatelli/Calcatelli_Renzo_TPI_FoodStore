from typing import TYPE_CHECKING, Optional

from sqlalchemy import Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    """Se vende solo si activo, disponible y stock >= cantidad (RN-01).
    stock se descuenta al crear el pedido y se restituye al cancelar (RN-03).
    Baja lógica: activo = false."""

    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id", index=True, nullable=False)
    nombre: str = Field(max_length=150, index=True, nullable=False)
    descripcion: Optional[str] = Field(default=None, sa_type=Text)
    precio_base: float = Field(nullable=False)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    categoria: "Categoria" = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")

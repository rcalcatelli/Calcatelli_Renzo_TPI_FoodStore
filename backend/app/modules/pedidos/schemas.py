from datetime import datetime
from typing import Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel

from .models import EstadoPedido, FormaPago


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0, schema_extra={"examples": [1]})
    cantidad: int = Field(ge=1, schema_extra={"examples": [2]})


class PedidoCreate(SQLModel):
    """RN-06: forma_pago es EFECTIVO o TRANSFERENCIA y direccion_entrega tiene entre 5 y 200 caracteres."""

    model_config = ConfigDict(str_strip_whitespace=True)

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200, schema_extra={"examples": ["San Martín 1234, Mendoza"]})
    notas: Optional[str] = Field(default=None, max_length=500)


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: Optional[str]
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float

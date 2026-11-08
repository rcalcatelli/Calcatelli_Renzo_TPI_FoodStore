from typing import Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    # str_strip_whitespace: "   " queda vacío y falla min_length
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=2, max_length=100, schema_extra={"examples": ["Pizzas"]})
    descripcion: Optional[str] = Field(
        default=None, max_length=500, schema_extra={"examples": ["Pizzas artesanales a la piedra"]}
    )


class CategoriaUpdate(SQLModel):
    """PUT con actualización parcial: solo se modifican los campos enviados."""

    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    activo: bool

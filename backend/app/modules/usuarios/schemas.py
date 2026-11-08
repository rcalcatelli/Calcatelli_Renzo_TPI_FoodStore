from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, EmailStr
from sqlmodel import Field, SQLModel

Rol = Literal["user", "admin"]


class UserCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(min_length=3, max_length=50, schema_extra={"examples": ["juanperez"]})
    full_name: str = Field(min_length=2, max_length=100, schema_extra={"examples": ["Juan Pérez"]})
    email: EmailStr = Field(schema_extra={"examples": ["juan@mail.com"]})
    password: str = Field(min_length=8, max_length=72, schema_extra={"examples": ["Secreta123"]})


class UserPublic(SQLModel):
    """Datos públicos del usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: Rol
    disabled: bool
    created_at: datetime

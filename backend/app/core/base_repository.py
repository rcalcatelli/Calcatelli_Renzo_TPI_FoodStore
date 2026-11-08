from typing import Any, Generic, Sequence, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """CRUD genérico sobre un modelo de SQLModel.

    El repositorio solo habla con la base: no tiene reglas de negocio,
    no lanza HTTPException y nunca hace commit (eso es tarea del UnitOfWork).
    """

    model: Type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, record_id: Any) -> T | None:
        return self.session.get(self.model, record_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, instance: T) -> T:
        # flush ejecuta el INSERT/UPDATE y genera el id, sin confirmar la transacción
        self.session.add(instance)
        self.session.flush()
        self.session.refresh(instance)
        return instance

    def delete(self, instance: T) -> None:
        self.session.delete(instance)
        self.session.flush()

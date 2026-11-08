from typing import Callable, Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Controla la transacción de una operación completa.

        with self.uow as uow:
            ...
        # sin excepción → commit · con excepción → rollback · siempre → close

    Abre la sesión en __enter__ y es la única capa que llama a commit() y rollback().
    Cada módulo hereda y crea sus repositorios en `_crear_repositorios`.
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory
        self.session: Session

    def __enter__(self) -> Self:
        self.session = self._session_factory()
        self._crear_repositorios(self.session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()

    def _crear_repositorios(self, session: Session) -> None:
        """Los Unit of Work de cada módulo exponen aquí sus repositorios."""

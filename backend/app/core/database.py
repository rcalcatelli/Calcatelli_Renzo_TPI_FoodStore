from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_url = make_url(settings.DATABASE_URL)

# SQLite (solo desarrollo) necesita permitir el uso de la conexión desde otros hilos
_connect_args = {"check_same_thread": False} if _url.drivername.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el UnitOfWork en __enter__."""
    return Session(engine)


def crear_base_si_no_existe() -> None:
    """Crea la base de PostgreSQL si todavía no existe (evita crearla a mano en pgAdmin)."""
    if not _url.drivername.startswith("postgresql") or not _url.database:
        return
    admin_engine = create_engine(_url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        existe = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :nombre"), {"nombre": _url.database}
        ).scalar()
        if not existe:
            conn.execute(text(f'CREATE DATABASE "{_url.database}"'))
    admin_engine.dispose()


def create_all_tables() -> None:
    # Importar los modelos los registra en SQLModel.metadata
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    crear_base_si_no_existe()
    SQLModel.metadata.create_all(engine)

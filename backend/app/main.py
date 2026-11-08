from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al iniciar: crea la base y las tablas si faltan (los datos los carga app.db.seed)
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Trabajo Práctico Integrador · Programación IV. Catálogo, carrito y pedidos con "
    "autenticación JWT en cookie HttpOnly y roles user / admin.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador envía la cookie solo si el origen está permitido explícitamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(router, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
def raiz():
    return RedirectResponse(url="/docs")

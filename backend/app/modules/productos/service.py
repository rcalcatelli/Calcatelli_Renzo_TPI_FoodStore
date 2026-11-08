from app.modules.categorias.service import CategoriaNoEncontrada

from .models import Producto
from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate
from .unit_of_work import ProductoUnitOfWork


# ── Excepciones de dominio (el Router las traduce a HTTP) ─────────────────────


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto con id {producto_id} no encontrado")


class ProductoService:
    """Reglas de negocio de Productos. Devuelve los schemas dentro del bloque `with self.uow`."""

    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    # ── Auxiliares ────────────────────────────────────────────────────────────

    @staticmethod
    def _get_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        # Un producto dado de baja se trata como inexistente
        producto = uow.productos.get_activo(producto_id)
        if producto is None:
            raise ProductoNoEncontrado(producto_id)
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        if uow.categorias.get_activa(categoria_id) is None:
            raise CategoriaNoEncontrada(categoria_id)

    # ── Casos de uso ──────────────────────────────────────────────────────────

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in productos])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._get_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            # Los campos obligatorios enviados como null se ignoran; descripcion e imagen_url sí se pueden vaciar
            obligatorios = {"nombre", "precio_base", "stock", "disponible", "categoria_id"}
            cambios = {
                k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None or k not in obligatorios
            }
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.sqlmodel_update(data.model_dump(exclude_unset=True, exclude_none=True))
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

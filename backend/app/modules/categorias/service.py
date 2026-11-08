from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


# ── Excepciones de dominio (el Router las traduce a HTTP) ─────────────────────


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría con id {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    """Reglas de negocio de Categorías. Devuelve los schemas dentro del bloque
    `with self.uow`, antes de que el commit expire los objetos."""

    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    # ── Auxiliares ────────────────────────────────────────────────────────────

    @staticmethod
    def _get_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        # Una categoría dada de baja se trata como inexistente
        categoria = uow.categorias.get_activa(categoria_id)
        if categoria is None:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    @staticmethod
    def _validar_nombre_unico(uow: CategoriaUnitOfWork, nombre: str, excluir_id: int | None = None) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente is not None and existente.id != excluir_id:
            raise NombreDuplicado(nombre)

    # ── Casos de uso ──────────────────────────────────────────────────────────

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.listar_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._get_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre_unico(uow, data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)  # 404 tiene prioridad sobre 409
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("nombre") is not None:
                self._validar_nombre_unico(uow, cambios["nombre"], excluir_id=categoria_id)
            else:
                cambios.pop("nombre", None)  # el nombre es obligatorio: null no lo borra
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No toca sus productos: para retirarlos del catálogo se dan de baja aparte."""
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

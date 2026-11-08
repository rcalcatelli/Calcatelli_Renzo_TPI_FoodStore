from datetime import datetime

from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

from .models import DetallePedido, EstadoPedido, Pedido, ahora
from .schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

# RN-02: mapa de transiciones válidas. ENTREGADO y CANCELADO son terminales.
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


# ── Excepciones de dominio (el Router las traduce a HTTP) ─────────────────────


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido con id {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio que responden 400."""


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, cantidad: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock} y se pidieron {cantidad}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


class PedidoNoCancelable(ReglaDeNegocio):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido en PENDIENTE (estado actual: {estado})")


class PedidoService:
    """Creación transaccional, máquina de estados, cancelación y resumen (RN-01 a RN-06)."""

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ── Auxiliares ────────────────────────────────────────────────────────────

    @staticmethod
    def _get_pedido(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _validar_acceso(pedido: Pedido, usuario: UserPublic) -> None:
        # RN-04: el cliente solo ve sus pedidos; el admin ve todos
        if usuario.role != "admin" and pedido.usuario_id != usuario.id:
            raise PedidoAjeno()

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: en la misma transacción que cambia el estado
        for item in pedido.items:
            producto = uow.productos.get_para_actualizar(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def _pasar_a(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> PedidoRead:
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(actual, nuevo)
        if nuevo == EstadoPedido.CANCELADO:
            self._restituir_stock(uow, pedido)
        pedido.estado = nuevo
        pedido.updated_at = ahora()
        uow.pedidos.add(pedido)
        return PedidoRead.model_validate(pedido)

    # ── Casos de uso ──────────────────────────────────────────────────────────

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        """RN-01: todo en una sola transacción. Si una validación falla, el Unit of Work
        hace rollback y no se persiste nada, tampoco el descuento de stock."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            for producto_id in ids:
                if ids.count(producto_id) > 1:
                    raise ProductoRepetido(producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=EstadoPedido.PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas or None,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_para_actualizar(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                # Copia del nombre y del precio: la línea no cambia si después cambia el producto (RN-05)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: EstadoPedido | None) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(skip, limit, usuario_id, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            self._validar_acceso(pedido, usuario)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        """Admin: avanza o cancela según la máquina de estados (RN-02, RN-03)."""
        with self.uow as uow:
            return self._pasar_a(uow, self._get_pedido(uow, pedido_id), data.estado)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Dueño: cancela su pedido solo si está en PENDIENTE (RN-03, RN-04)."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE:
                raise PedidoNoCancelable(pedido.estado)
            return self._pasar_a(uow, pedido, EstadoPedido.CANCELADO)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_del_dia = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=round(uow.pedidos.sum_total_entregados(), 2),
            )

import { ETIQUETA_ESTADO, type EstadoPedido } from '../../features/pedidos/types/pedido'

const COLORES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-sky-100 text-sky-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-700',
}

// Colorea los cuatro estados del pedido
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`badge ${COLORES[estado]}`}>{ETIQUETA_ESTADO[estado]}</span>
}

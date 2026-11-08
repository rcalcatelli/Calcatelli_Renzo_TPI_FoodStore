import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { Modal } from '../../../shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { PedidosTabla } from '../components/PedidosTabla'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO, type EstadoPedido, type Pedido } from '../types/pedido'

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table
  const pedidos = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detalle = pedidos.data?.items.find((p) => p.id === detalleId) ?? null

  function cambiar(pedido: Pedido, nuevo: EstadoPedido) {
    setError(null)
    // Cancelar restituye stock: se pide confirmación
    if (nuevo === 'CANCELADO') {
      setACancelar(pedido)
      return
    }
    cambiarEstado.mutate({ id: pedido.id, estado: nuevo }, { onError: (e) => setError(handleApiError(e)) })
  }

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        descripcion={`${pedidos.data?.total ?? 0} pedidos${estado ? ` en ${ETIQUETA_ESTADO[estado].toLowerCase()}` : ''}`}
        accion={
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Estado
            <select
              value={estado ?? ''}
              onChange={(e) => setEstado((e.target.value || undefined) as EstadoPedido | undefined)}
              className="input w-48"
            >
              <option value="">Todos</option>
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {error && !aCancelar && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <PedidosTabla
          pedidos={pedidos.data?.items ?? []}
          cargando={pedidos.isPending}
          procesandoId={cambiarEstado.isPending ? cambiarEstado.variables.id : undefined}
          onVer={(pedido) => setDetalleId(pedido.id)}
          onCambiarEstado={cambiar}
        />
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalleId(null)} ancho="lg">
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <ConfirmDialog
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ''}? El stock de sus productos se restituye.`}
        textoConfirmar="Sí, cancelar"
        procesando={cambiarEstado.isPending}
        error={error}
        onConfirmar={() =>
          aCancelar &&
          cambiarEstado.mutate(
            { id: aCancelar.id, estado: 'CANCELADO' },
            { onSuccess: () => setACancelar(null), onError: (e) => setError(handleApiError(e)) },
          )
        }
        onCancelar={() => setACancelar(null)}
      />
    </>
  )
}

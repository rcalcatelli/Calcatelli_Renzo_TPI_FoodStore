import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { Modal } from '../../../shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()
  const location = useLocation()
  const creado = (location.state as { creado?: number } | null)?.creado

  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [error, setError] = useState<string | null>(null)

  // El detalle se toma de la lista (que ya trae las líneas), así se actualiza al cancelar
  const detalle = pedidos.data?.items.find((p) => p.id === detalleId) ?? null
  const totalPaginas = Math.ceil((pedidos.data?.total ?? 0) / POR_PAGINA)

  function confirmarCancelacion() {
    if (!aCancelar) return
    cancelar.mutate(aCancelar.id, {
      onSuccess: () => setACancelar(null),
      onError: (e) => setError(handleApiError(e)),
    })
  }

  return (
    <>
      <PageHeader titulo="Mis pedidos" descripcion="Podés cancelar un pedido mientras está pendiente." />

      {creado && (
        <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          ¡Pedido #{creado} confirmado! Te avisamos cuando empiece a prepararse.
        </p>
      )}

      {pedidos.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="flex flex-col gap-2 p-5">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="font-semibold text-orange-600 hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-3">
            {pedidos.data.items.map((pedido) => (
              <li key={pedido.id}>
                <Card className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-48 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-900">Pedido #{pedido.id}</p>
                      <BadgeEstado estado={pedido.estado} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatearFecha(pedido.created_at)} · {pedido.items.length}{' '}
                      {pedido.items.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <p className="text-lg font-extrabold">{formatearPrecio(pedido.total)}</p>
                  <div className="flex gap-2">
                    <Button variante="secundario" onClick={() => setDetalleId(pedido.id)}>
                      Ver detalle
                    </Button>
                    {/* Solo se cancela en PENDIENTE (RN-04) */}
                    {pedido.estado === 'PENDIENTE' && (
                      <Button
                        variante="peligro"
                        onClick={() => {
                          setError(null)
                          setACancelar(pedido)
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} deshabilitado={pedidos.isPlaceholderData} />
        </div>
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalleId(null)} ancho="lg">
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <ConfirmDialog
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ''}? Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, cancelar"
        procesando={cancelar.isPending}
        error={error}
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setACancelar(null)}
      />
    </>
  )
}

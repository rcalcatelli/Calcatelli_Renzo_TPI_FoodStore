import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <>
      <PageHeader titulo="Resumen del negocio" descripcion="Indicadores calculados a partir de los pedidos." />

      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="flex flex-col gap-2 p-5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </Card>
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen
            titulo="Ingresos entregados"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            detalle="Suma del total de los pedidos entregados"
            acento="border-l-emerald-500"
          />
          <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} acento="border-l-orange-500" />
          <TarjetaResumen titulo="Pendientes" valor={String(resumen.data.pendientes)} acento="border-l-amber-400" />
          <TarjetaResumen titulo="En preparación" valor={String(resumen.data.en_preparacion)} acento="border-l-sky-500" />
          <TarjetaResumen titulo="Entregados" valor={String(resumen.data.entregados)} acento="border-l-emerald-500" />
          <TarjetaResumen titulo="Cancelados" valor={String(resumen.data.cancelados)} acento="border-l-red-500" />
        </div>
      )}
    </>
  )
}

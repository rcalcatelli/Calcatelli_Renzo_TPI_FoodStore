import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <>
        <PageHeader titulo="Carrito" />
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo."
          accion={
            <Link to="/" className="font-semibold text-orange-600 hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Carrito"
        descripcion="Se guarda en este navegador aunque recargues la página."
        accion={
          <Button variante="fantasma" onClick={vaciar}>
            Vaciar carrito
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-40 flex-1">
                <p className="font-semibold text-slate-900">{item.nombre}</p>
                <p className="text-sm text-slate-500">{formatearPrecio(item.precio_unitario)} c/u</p>
              </div>

              <div className="flex items-center gap-1" aria-label={`Cantidad de ${item.nombre}`}>
                <Button
                  tamano="sm"
                  variante="secundario"
                  aria-label="Restar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                <Button
                  tamano="sm"
                  variante="secundario"
                  aria-label="Sumar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>

              <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>

              <Button tamano="sm" variante="fantasma" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </div>
          ))}
        </Card>

        <Card className="flex h-fit flex-col gap-4 p-5">
          <h2 className="font-bold text-slate-900">Resumen</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Productos</span>
            <span>{items.reduce((suma, i) => suma + i.cantidad, 0)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Button onClick={() => navigate('/checkout')}>Continuar con el pedido</Button>
          <p className="text-xs text-slate-400">El precio y el stock se confirman al crear el pedido.</p>
        </Card>
      </div>
    </>
  )
}

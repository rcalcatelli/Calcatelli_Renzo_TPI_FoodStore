import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  function confirmar({ direccion_entrega, forma_pago, notas }: DatosCheckout) {
    setError(null)
    crearPedido.mutate(
      {
        items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        forma_pago,
        direccion_entrega,
        notas: notas || null,
      },
      {
        onSuccess: (pedido) => {
          navigate('/mis-pedidos', { replace: true, state: { creado: pedido.id } })
          vaciar()
        },
        onError: (e) => setError(handleApiError(e)),
      },
    )
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío."
        accion={
          <Link to="/" className="font-semibold text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <>
      <PageHeader titulo="Confirmar pedido" descripcion="Indicá dónde lo entregamos y cómo vas a pagar." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <CheckoutForm enviando={crearPedido.isPending} error={error} onConfirmar={confirmar} />
        </Card>

        <Card className="flex h-fit flex-col gap-3 p-5">
          <h2 className="font-bold text-slate-900">Tu pedido</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-2">
                <span className="text-slate-600">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Link to="/carrito" className="text-sm font-medium text-orange-600 hover:underline">
            Modificar carrito
          </Link>
        </Card>
      </div>
    </>
  )
}

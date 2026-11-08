import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock === 0
  const vendible = producto.disponible && !sinStock
  const alcanzoStock = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Recuadro de proporción fija: la imagen se posiciona en absoluto para no estirarlo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden>
            🍽️
          </div>
        )}
        {!vendible && (
          <span className="badge absolute top-3 left-3 bg-slate-900/80 text-white">
            {producto.disponible ? 'Sin stock' : 'No disponible'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold tracking-wide text-orange-600 uppercase">{producto.categoria.nombre}</span>
        <h3 className="font-bold text-slate-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-lg font-extrabold text-slate-900">{formatearPrecio(producto.precio_base)}</p>
          {vendible && <p className="text-xs text-slate-400">Stock: {producto.stock}</p>}
        </div>

        <Button
          disabled={!vendible || alcanzoStock}
          onClick={() =>
            agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })
          }
        >
          {enCarrito > 0 ? `Agregar otro (${enCarrito} en el carrito)` : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}

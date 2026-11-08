import { useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  // Paginación en el servidor: skip = página × limit
  const productos = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = Math.ceil((productos.data?.total ?? 0) / POR_PAGINA)
  const hayFiltros = Boolean(search || categoriaId)

  function buscar(valor: string) {
    setSearch(valor.trim())
    setPagina(0)
  }

  function filtrarCategoria(id: number | undefined) {
    setCategoriaId(id)
    setPagina(0)
  }

  function limpiarFiltros() {
    setTexto('')
    buscar('')
    filtrarCategoria(undefined)
  }

  return (
    <>
      <PageHeader titulo="Catálogo" descripcion="Elegí tus productos y armá el pedido." />

      <div className="mb-6 flex flex-col gap-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            buscar(texto)
          }}
          className="flex gap-2"
        >
          <input
            type="search"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              if (!e.target.value) buscar('') // al vaciar el buscador vuelve a la lista completa
            }}
            placeholder="Buscar por nombre…"
            aria-label="Buscar productos"
            className="input sm:max-w-sm"
          />
          <Button type="submit">Buscar</Button>
        </form>

        <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
          <FiltroChip activo={categoriaId === undefined} onClick={() => filtrarCategoria(undefined)}>
            Todas
          </FiltroChip>
          {categorias.data?.map((c) => (
            <FiltroChip key={c.id} activo={categoriaId === c.id} onClick={() => filtrarCategoria(c.id)}>
              {c.nombre}
            </FiltroChip>
          ))}
        </div>
      </div>

      {productos.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: POR_PAGINA }, (_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo={hayFiltros ? 'No hay productos que coincidan' : 'Todavía no hay productos'}
          descripcion={hayFiltros ? 'Probá con otra búsqueda u otra categoría.' : undefined}
          accion={
            hayFiltros && (
              <Button variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          <div
            className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            {productos.data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiar={setPagina}
            deshabilitado={productos.isPlaceholderData}
          />
        </div>
      )}
    </>
  )
}

interface FiltroChipProps {
  activo: boolean
  onClick: () => void
  children: string
}

function FiltroChip({ activo, onClick, children }: FiltroChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        activo
          ? 'border-orange-600 bg-orange-600 text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-700'
      }`}
    >
      {children}
    </button>
  )
}

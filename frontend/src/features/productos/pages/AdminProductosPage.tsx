import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { PageHeader } from '../../../shared/layout/PageHeader'
import { Button } from '../../../shared/ui/Button'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { StockModal } from '../components/StockModal'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoInput, ProductoStockInput } from '../types/producto'

type Dialogo =
  | { tipo: 'form'; producto: Producto | null }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null

interface AccionesProducto {
  onEditar: (p: Producto) => void
  onStock: (p: Producto) => void
  onEliminar: (p: Producto) => void
}

const columna = createColumnHelper<Producto>()

function crearColumnas({ onEditar, onStock, onEliminar }: AccionesProducto) {
  return [
    columna.accessor('id', { header: 'ID' }),
    columna.accessor('nombre', {
      header: 'Nombre',
      cell: (info) => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
    }),
    columna.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    columna.accessor('precio_base', { header: 'Precio', cell: (info) => formatearPrecio(info.getValue()) }),
    columna.accessor('stock', {
      header: 'Stock',
      cell: (info) => <span className={info.getValue() === 0 ? 'font-semibold text-red-600' : ''}>{info.getValue()}</span>,
    }),
    columna.accessor('disponible', {
      header: 'Disponible',
      cell: (info) =>
        info.getValue() ? (
          <span className="badge bg-emerald-100 text-emerald-800">Sí</span>
        ) : (
          <span className="badge bg-slate-200 text-slate-600">No</span>
        ),
    }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <Button tamano="sm" variante="secundario" onClick={() => onEditar(row.original)}>
            Editar
          </Button>
          <Button tamano="sm" variante="secundario" onClick={() => onStock(row.original)}>
            Stock
          </Button>
          <Button tamano="sm" variante="peligro" onClick={() => onEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]
}

export function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  function abrir(nuevo: Dialogo) {
    setError(null)
    setDialogo(nuevo)
  }

  const alError = { onError: (e: unknown) => setError(handleApiError(e)), onSuccess: () => setDialogo(null) }

  function guardar(input: ProductoInput) {
    if (dialogo?.tipo !== 'form') return
    if (dialogo.producto) actualizar.mutate({ id: dialogo.producto.id, input }, alError)
    else crear.mutate(input, alError)
  }

  function guardarStock(input: ProductoStockInput) {
    if (dialogo?.tipo === 'stock') actualizarStock.mutate({ id: dialogo.producto.id, input }, alError)
  }

  const table = useReactTable({
    data: productos.data?.items ?? [],
    columns: crearColumnas({
      onEditar: (producto) => abrir({ tipo: 'form', producto }),
      onStock: (producto) => abrir({ tipo: 'stock', producto }),
      onEliminar: (producto) => abrir({ tipo: 'eliminar', producto }),
    }),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <>
      <PageHeader
        titulo="Productos"
        descripcion={`${productos.data?.total ?? 0} productos activos`}
        accion={<Button onClick={() => abrir({ tipo: 'form', producto: null })}>Nuevo producto</Button>}
      />

      {productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : (
        <DataTable table={table} cargando={productos.isPending} mensajeVacio="Todavía no hay productos." />
      )}

      {dialogo?.tipo === 'form' && (
        <ProductoFormModal
          producto={dialogo.producto}
          categorias={categorias.data ?? []}
          guardando={crear.isPending || actualizar.isPending}
          error={error}
          onGuardar={guardar}
          onCerrar={() => setDialogo(null)}
        />
      )}

      {dialogo?.tipo === 'stock' && (
        <StockModal
          producto={dialogo.producto}
          guardando={actualizarStock.isPending}
          error={error}
          onGuardar={guardarStock}
          onCerrar={() => setDialogo(null)}
        />
      )}

      <ConfirmDialog
        abierto={dialogo?.tipo === 'eliminar'}
        titulo="Eliminar producto"
        mensaje={`¿Dar de baja "${dialogo?.producto?.nombre ?? ''}"? Deja de mostrarse en el catálogo; los pedidos ya hechos no cambian.`}
        textoConfirmar="Eliminar"
        procesando={eliminar.isPending}
        error={error}
        onConfirmar={() => dialogo?.tipo === 'eliminar' && eliminar.mutate(dialogo.producto.id, alError)}
        onCancelar={() => setDialogo(null)}
      />
    </>
  )
}

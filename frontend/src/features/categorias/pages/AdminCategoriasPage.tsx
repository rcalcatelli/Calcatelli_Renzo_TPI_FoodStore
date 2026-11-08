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
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

type Dialogo = { tipo: 'form'; categoria: Categoria | null } | { tipo: 'eliminar'; categoria: Categoria } | null

const columna = createColumnHelper<Categoria>()

function crearColumnas(onEditar: (c: Categoria) => void, onEliminar: (c: Categoria) => void) {
  return [
    columna.accessor('id', { header: 'ID' }),
    columna.accessor('nombre', {
      header: 'Nombre',
      cell: (info) => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
    }),
    columna.accessor('descripcion', {
      header: 'Descripción',
      enableSorting: false,
      cell: (info) => info.getValue() || <span className="text-slate-400">—</span>,
    }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <Button tamano="sm" variante="secundario" onClick={() => onEditar(row.original)}>
            Editar
          </Button>
          <Button tamano="sm" variante="peligro" onClick={() => onEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]
}

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  function abrir(nuevo: Dialogo) {
    setError(null)
    setDialogo(nuevo)
  }

  const callbacks = { onError: (e: unknown) => setError(handleApiError(e)), onSuccess: () => setDialogo(null) }

  function guardar(input: CategoriaInput) {
    if (dialogo?.tipo !== 'form') return
    if (dialogo.categoria) actualizar.mutate({ id: dialogo.categoria.id, input }, callbacks)
    else crear.mutate(input, callbacks)
  }

  const table = useReactTable({
    data: categorias.data ?? [],
    columns: crearColumnas(
      (categoria) => abrir({ tipo: 'form', categoria }),
      (categoria) => abrir({ tipo: 'eliminar', categoria }),
    ),
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
        titulo="Categorías"
        descripcion="Cada producto pertenece a una categoría."
        accion={<Button onClick={() => abrir({ tipo: 'form', categoria: null })}>Nueva categoría</Button>}
      />

      {categorias.isError ? (
        <EstadoError error={categorias.error} onReintentar={() => void categorias.refetch()} />
      ) : (
        <DataTable table={table} cargando={categorias.isPending} mensajeVacio="Todavía no hay categorías." />
      )}

      {dialogo?.tipo === 'form' && (
        <CategoriaFormModal
          categoria={dialogo.categoria}
          guardando={crear.isPending || actualizar.isPending}
          error={error}
          onGuardar={guardar}
          onCerrar={() => setDialogo(null)}
        />
      )}

      <ConfirmDialog
        abierto={dialogo?.tipo === 'eliminar'}
        titulo="Eliminar categoría"
        mensaje={`¿Dar de baja "${dialogo?.categoria?.nombre ?? ''}"? Sus productos siguen a la venta: para retirarlos del catálogo, dalos de baja desde Productos. El nombre no se puede volver a usar.`}
        textoConfirmar="Eliminar"
        procesando={eliminar.isPending}
        error={error}
        onConfirmar={() => dialogo?.tipo === 'eliminar' && eliminar.mutate(dialogo.categoria.id, callbacks)}
        onCancelar={() => setDialogo(null)}
      />
    </>
  )
}

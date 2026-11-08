import { flexRender, type Table } from '@tanstack/react-table'
import { Paginacion } from './Paginacion'
import { Skeleton } from './Skeleton'

interface DataTableProps<T> {
  table: Table<T>
  cargando: boolean
  mensajeVacio: string
}

const FLECHAS: Record<string, string> = { asc: '↑', desc: '↓' }
const FILAS_SKELETON = 5

// Renderiza cualquier tabla de TanStack Table: orden por columna, paginación
// del lado del cliente, skeleton mientras carga y estado vacío.
export function DataTable<T>({ table, cargando, mensajeVacio }: DataTableProps<T>) {
  const columnas = table.getVisibleLeafColumns().length
  const filas = table.getRowModel().rows
  const { pageIndex } = table.getState().pagination

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const orden = header.column.getIsSorted()
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-slate-800"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="w-3 text-orange-600">{orden ? FLECHAS[orden] : ''}</span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100">
            {cargando &&
              Array.from({ length: FILAS_SKELETON }, (_, i) => (
                <tr key={i}>
                  {Array.from({ length: columnas }, (_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}

            {!cargando && filas.length === 0 && (
              <tr>
                <td colSpan={columnas} className="px-4 py-12 text-center text-slate-500">
                  {mensajeVacio}
                </td>
              </tr>
            )}

            {!cargando &&
              filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-slate-50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-slate-700">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!cargando && table.getPageCount() > 1 && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <Paginacion pagina={pageIndex} totalPaginas={table.getPageCount()} onCambiar={table.setPageIndex} />
        </div>
      )}
    </div>
  )
}

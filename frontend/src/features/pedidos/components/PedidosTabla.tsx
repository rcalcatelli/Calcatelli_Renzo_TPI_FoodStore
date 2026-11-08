import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { DataTable } from '../../../shared/components/DataTable'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { ETIQUETA_ESTADO, ETIQUETA_FORMA_PAGO, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

interface PedidosTablaProps {
  pedidos: Pedido[]
  cargando: boolean
  procesandoId: number | undefined
  onVer: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

const columna = createColumnHelper<Pedido>()

type Acciones = Pick<PedidosTablaProps, 'procesandoId' | 'onVer' | 'onCambiarEstado'>

function crearColumnas({ procesandoId, onVer, onCambiarEstado }: Acciones) {
  return [
    columna.accessor('id', { header: 'N°', cell: (info) => <span className="font-semibold">#{info.getValue()}</span> }),
    columna.accessor('usuario_id', { header: 'Cliente (id)' }),
    columna.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
    columna.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
    columna.accessor('forma_pago', { header: 'Pago', cell: (info) => ETIQUETA_FORMA_PAGO[info.getValue()] }),
    columna.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original
        // Botones según la máquina de estados: avanzar al siguiente estado o cancelar
        const siguientes = TRANSICIONES[pedido.estado]
        const procesando = procesandoId === pedido.id
        return (
          <div className="flex flex-wrap gap-1.5">
            <Button tamano="sm" variante="secundario" onClick={() => onVer(pedido)}>
              Ver
            </Button>
            {siguientes.map((estado) => (
              <Button
                key={estado}
                tamano="sm"
                variante={estado === 'CANCELADO' ? 'peligro' : 'exito'}
                disabled={procesando}
                onClick={() => onCambiarEstado(pedido, estado)}
              >
                {estado === 'CANCELADO' ? 'Cancelar' : `→ ${ETIQUETA_ESTADO[estado]}`}
              </Button>
            ))}
          </div>
        )
      },
    }),
  ]
}

export function PedidosTabla({ pedidos, cargando, ...acciones }: PedidosTablaProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: pedidos,
    columns: crearColumnas(acciones),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return <DataTable table={table} cargando={cargando} mensajeVacio="No hay pedidos con este filtro." />
}

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
import { useAuthStore } from '../../../store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

const columna = createColumnHelper<Usuario>()

interface OpcionesColumnas {
  idSesion: number | undefined
  procesandoId: number | undefined
  onCambiar: (usuario: Usuario, activar: boolean) => void
}

function crearColumnas({ idSesion, procesandoId, onCambiar }: OpcionesColumnas) {
  return [
    columna.accessor('username', {
      header: 'Usuario',
      cell: (info) => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
    }),
    columna.accessor('full_name', { header: 'Nombre' }),
    columna.accessor('email', { header: 'Email' }),
    columna.accessor('role', {
      header: 'Rol',
      cell: (info) =>
        info.getValue() === 'admin' ? (
          <span className="badge bg-violet-100 text-violet-800">Admin</span>
        ) : (
          <span className="badge bg-slate-100 text-slate-700">Cliente</span>
        ),
    }),
    columna.accessor('disabled', {
      header: 'Estado',
      cell: (info) =>
        info.getValue() ? (
          <span className="badge bg-red-100 text-red-700">Inactivo</span>
        ) : (
          <span className="badge bg-emerald-100 text-emerald-800">Activo</span>
        ),
    }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original
        // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila
        if (usuario.id === idSesion) return <span className="text-xs text-slate-400">Tu usuario</span>
        return usuario.disabled ? (
          <Button tamano="sm" variante="exito" cargando={procesandoId === usuario.id} onClick={() => onCambiar(usuario, true)}>
            Activar
          </Button>
        ) : (
          <Button tamano="sm" variante="peligro" cargando={procesandoId === usuario.id} onClick={() => onCambiar(usuario, false)}>
            Desactivar
          </Button>
        )
      },
    }),
  ]
}

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()
  const idSesion = useAuthStore((s) => s.usuario?.id)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: usuarios.data ?? [],
    columns: crearColumnas({
      idSesion,
      procesandoId: cambiarEstado.isPending ? cambiarEstado.variables.id : undefined,
      onCambiar: (usuario, activar) => {
        setError(null)
        cambiarEstado.mutate({ id: usuario.id, activar }, { onError: (e) => setError(handleApiError(e)) })
      },
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
      <PageHeader titulo="Usuarios" descripcion="Un usuario inactivo no puede iniciar sesión." />
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {usuarios.isError ? (
        <EstadoError error={usuarios.error} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <DataTable table={table} cargando={usuarios.isPending} mensajeVacio="No hay usuarios registrados." />
      )}
    </>
  )
}

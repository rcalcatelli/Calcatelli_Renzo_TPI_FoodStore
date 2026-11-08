import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../types/usuario'

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/admin/usuarios')
  return data
}

export async function activarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/activar`)
  return data
}

export async function desactivarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`)
  return data
}

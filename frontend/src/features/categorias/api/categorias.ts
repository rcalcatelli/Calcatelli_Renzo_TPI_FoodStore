import { api } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types/categoria'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(input: CategoriaInput): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', input)
  return data
}

export async function actualizarCategoria(id: number, input: Partial<CategoriaInput>): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, input)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}

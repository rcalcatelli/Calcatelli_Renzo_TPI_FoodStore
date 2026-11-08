import { api } from '../../../shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  ProductoStockInput,
} from '../types/producto'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export async function crearProducto(input: ProductoInput): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', input)
  return data
}

export async function actualizarProducto(id: number, input: Partial<ProductoInput>): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, input)
  return data
}

export async function actualizarStock(id: number, input: ProductoStockInput): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, input)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}

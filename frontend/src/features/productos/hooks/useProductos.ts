import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productosApi from '../api/productos'
import type { FiltrosProductos, ProductoInput, ProductoStockInput } from '../types/producto'

export const PRODUCTOS_KEY = ['productos'] as const

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, filtros],
    queryFn: () => productosApi.getProductos(filtros),
    // Mantiene la página anterior en pantalla mientras llega la siguiente
    placeholderData: keepPreviousData,
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: productosApi.crearProducto, onSuccess: invalidar })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProductoInput> }) =>
      productosApi.actualizarProducto(id, input),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductoStockInput }) => productosApi.actualizarStock(id, input),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: productosApi.eliminarProducto, onSuccess: invalidar })
}

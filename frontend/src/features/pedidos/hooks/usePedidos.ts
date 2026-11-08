import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PRODUCTOS_KEY } from '../../productos/hooks/useProductos'
import * as pedidosApi from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido'

export const PEDIDOS_KEY = ['pedidos'] as const

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: [...PEDIDOS_KEY, 'lista', filtros],
    queryFn: () => pedidosApi.getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: [...PEDIDOS_KEY, 'resumen'], queryFn: pedidosApi.getResumenPedidos })
}

// Crear, avanzar o cancelar un pedido mueve el stock: se refrescan pedidos, resumen y productos
function useInvalidarPedidos() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY })
    void queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({ mutationFn: pedidosApi.crearPedido, onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({ mutationFn: pedidosApi.cancelarPedido, onSuccess: invalidar })
}

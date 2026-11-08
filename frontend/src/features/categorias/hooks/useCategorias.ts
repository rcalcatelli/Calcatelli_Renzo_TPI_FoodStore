import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as categoriasApi from '../api/categorias'
import type { CategoriaInput } from '../types/categoria'

export const CATEGORIAS_KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: CATEGORIAS_KEY, queryFn: categoriasApi.getCategorias })
}

// Los productos traen su categoría embebida: al cambiar una categoría se refrescan ambos
function useInvalidarCatalogo() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY })
    void queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCatalogo()
  return useMutation({ mutationFn: categoriasApi.crearCategoria, onSuccess: invalidar })
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCatalogo()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CategoriaInput> }) =>
      categoriasApi.actualizarCategoria(id, input),
    onSuccess: invalidar,
  })
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCatalogo()
  return useMutation({ mutationFn: categoriasApi.eliminarCategoria, onSuccess: invalidar })
}

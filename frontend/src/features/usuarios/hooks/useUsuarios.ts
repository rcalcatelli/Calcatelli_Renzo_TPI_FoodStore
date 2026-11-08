import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usuariosApi from '../api/usuarios'

export const USUARIOS_KEY = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: USUARIOS_KEY, queryFn: usuariosApi.getUsuarios })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? usuariosApi.activarUsuario(id) : usuariosApi.desactivarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}

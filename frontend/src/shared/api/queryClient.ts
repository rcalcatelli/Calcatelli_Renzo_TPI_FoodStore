import { QueryClient } from '@tanstack/react-query'
import { estadoHttp } from './handleApiError'

// Instancia única de TanStack Query para toda la aplicación
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Un 4xx no se arregla reintentando (404, 403, 401...)
      retry: (intentos, error) => {
        const status = estadoHttp(error)
        return (status === undefined || status >= 500) && intentos < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})

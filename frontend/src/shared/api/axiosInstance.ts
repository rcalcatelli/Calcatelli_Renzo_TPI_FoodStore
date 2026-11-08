import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../../store/authStore'
import { CUENTA_DESACTIVADA } from './handleApiError'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

// Instancia única: el navegador adjunta la cookie HttpOnly en cada petición.
// El frontend nunca lee ni guarda el token.
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// En el login y en checkSession un 401 es una respuesta esperada, no una sesión vencida
const RUTAS_SIN_INTERCEPTAR = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const sesionVencida = status === 401 && !RUTAS_SIN_INTERCEPTAR.some((ruta) => url.startsWith(ruta))
    const cuentaDesactivada = status === 400 && error.response?.data?.detail === CUENTA_DESACTIVADA

    if (sesionVencida || cuentaDesactivada) {
      // ProtectedRoute redirige a /login al quedar sin usuario
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)

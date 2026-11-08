import { isAxiosError } from 'axios'

export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// Forma de los errores de FastAPI: {"detail": "..."} o, en un 422,
// {"detail": [{"loc": [...], "msg": "..."}]}
interface ErrorValidacion {
  loc: (string | number)[]
  msg: string
}

interface ErrorApi {
  detail?: string | ErrorValidacion[]
}

/** Convierte el `detail` de la API en un mensaje para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (isAxiosError<ErrorApi>(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
    }
    const { detail } = error.response.data ?? {}
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((e) => `${e.loc.at(-1)}: ${e.msg}`).join(' · ')
    }
    return `Error ${error.response.status} al comunicarse con el servidor`
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}

export function estadoHttp(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

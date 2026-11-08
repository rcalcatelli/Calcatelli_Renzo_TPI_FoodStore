import { handleApiError } from '../api/handleApiError'
import { Button } from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="font-semibold text-red-700">No se pudieron cargar los datos</p>
      <p className="text-sm text-red-600">{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secundario" className="mt-2" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

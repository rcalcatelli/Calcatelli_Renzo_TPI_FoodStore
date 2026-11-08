import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar: string
  procesando: boolean
  error: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  procesando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar}>
      <p className="text-sm text-slate-600">{mensaje}</p>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar} disabled={procesando}>
          Volver
        </Button>
        <Button variante="peligro" onClick={onConfirmar} cargando={procesando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}

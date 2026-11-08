import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { FormField, Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { enteroMinimo } from '../../../shared/utils/validaciones'
import type { Producto, ProductoStockInput } from '../types/producto'

interface StockModalProps {
  producto: Producto
  guardando: boolean
  error: string | null
  onGuardar: (input: ProductoStockInput) => void
  onCerrar: () => void
}

// PATCH /productos/{id}/stock: cambia stock y disponibilidad sin tocar el resto
export function StockModal({ producto, guardando, error, onGuardar, onCerrar }: StockModalProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible } as ProductoStockInput,
    onSubmit: ({ value }) => onGuardar(value),
  })

  return (
    <Modal abierto titulo={`Stock · ${producto.nombre}`} onCerrar={onCerrar}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="stock" validators={{ onChange: enteroMinimo(0, 'El stock') }}>
          {(field) => (
            <FormField id={field.name} label="Stock" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
              <Input
                id={field.name}
                type="number"
                min={0}
                step={1}
                autoFocus
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                invalido={field.state.meta.isTouched && !field.state.meta.isValid}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-4 accent-orange-600"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form.Subscribe selector={(s) => s.canSubmit}>
          {(puedeEnviar) => (
            <div className="flex justify-end gap-2">
              <Button variante="secundario" onClick={onCerrar} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!puedeEnviar} cargando={guardando}>
                Guardar
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  )
}

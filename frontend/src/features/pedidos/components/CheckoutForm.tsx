import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { FormField } from '../../../shared/ui/Input'
import { largo, largoMaximo } from '../../../shared/utils/validaciones'
import { ETIQUETA_FORMA_PAGO, type FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  enviando: boolean
  error: string | null
  onConfirmar: (datos: DatosCheckout) => void
}

const VALORES_INICIALES: DatosCheckout = { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' }
const FORMAS_PAGO: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA']

// RN-06: dirección entre 5 y 200 caracteres y forma de pago EFECTIVO o TRANSFERENCIA
export function CheckoutForm({ enviando, error, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: ({ value }) =>
      onConfirmar({ ...value, direccion_entrega: value.direccion_entrega.trim(), notas: value.notas.trim() }),
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="direccion_entrega" validators={{ onChange: largo(5, 200, 'La dirección') }}>
        {(field) => (
          <FormField id={field.name} label="Dirección de entrega *" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
            <input
              id={field.name}
              autoComplete="street-address"
              placeholder="Calle, número, piso y ciudad"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className={`input ${field.state.meta.isTouched && !field.state.meta.isValid ? 'input-error' : ''}`}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="label">Forma de pago *</legend>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS_PAGO.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    field.state.value === forma ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="accent-orange-600"
                  />
                  {ETIQUETA_FORMA_PAGO[forma]}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-400">El pago se coordina al recibir el pedido (sin pasarela de pago).</p>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: largoMaximo(500) }}>
        {(field) => (
          <FormField id={field.name} label="Notas" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched} ayuda="Opcional. Ej: tocar timbre 2B">
            <textarea
              id={field.name}
              rows={2}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="input resize-none"
            />
          </FormField>
        )}
      </form.Field>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(puedeEnviar) => (
          <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

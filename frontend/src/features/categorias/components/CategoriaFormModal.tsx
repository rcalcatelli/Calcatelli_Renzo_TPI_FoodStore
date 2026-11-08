import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { FormField, Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { largo, largoMaximo } from '../../../shared/utils/validaciones'
import type { Categoria, CategoriaInput } from '../types/categoria'

interface CategoriaFormModalProps {
  categoria: Categoria | null // null = alta
  guardando: boolean
  error: string | null
  onGuardar: (input: CategoriaInput) => void
  onCerrar: () => void
}

// Se monta al abrirse, así el formulario arranca con los valores de la categoría elegida
export function CategoriaFormModal({ categoria, guardando, error, onGuardar, onCerrar }: CategoriaFormModalProps) {
  const esEdicion = categoria !== null

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' } as CategoriaInput,
    onSubmit: ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion?.trim() || null }),
  })

  return (
    <Modal abierto titulo={esEdicion ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCerrar}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="nombre" validators={{ onChange: largo(2, 100, 'El nombre') }}>
          {(field) => (
            <FormField id={field.name} label="Nombre *" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
              <Input
                id={field.name}
                autoFocus
                maxLength={100}
                placeholder="Ej: Empanadas"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                invalido={field.state.meta.isTouched && !field.state.meta.isValid}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="descripcion" validators={{ onChange: largoMaximo(500) }}>
          {(field) => (
            <FormField id={field.name} label="Descripción" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched} ayuda="Opcional">
              <textarea
                id={field.name}
                rows={3}
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="input resize-none"
              />
            </FormField>
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
                {esEdicion ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  )
}

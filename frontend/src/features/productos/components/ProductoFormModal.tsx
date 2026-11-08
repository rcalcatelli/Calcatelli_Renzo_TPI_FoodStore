import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { FormField, Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { enteroMinimo, largo, largoMaximo, numeroMinimo, seleccionObligatoria } from '../../../shared/utils/validaciones'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoInput } from '../types/producto'

interface ProductoFormModalProps {
  producto: Producto | null // null = alta
  categorias: Categoria[]
  guardando: boolean
  error: string | null
  onGuardar: (input: ProductoInput) => void
  onCerrar: () => void
}

function aFormulario(producto: Producto | null): ProductoInput {
  return {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto?.precio_base ?? 0,
    imagen_url: producto?.imagen_url ?? '',
    stock: producto?.stock ?? 0,
    disponible: producto?.disponible ?? true,
    categoria_id: producto?.categoria_id ?? 0,
  }
}

// Se monta al abrirse, así el formulario arranca con los valores del producto elegido
export function ProductoFormModal({ producto, categorias, guardando, error, onGuardar, onCerrar }: ProductoFormModalProps) {
  const esEdicion = producto !== null

  const form = useForm({
    defaultValues: aFormulario(producto),
    onSubmit: ({ value }) =>
      onGuardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion?.trim() || null,
        imagen_url: value.imagen_url?.trim() || null,
      }),
  })

  return (
    <Modal abierto titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'} onCerrar={onCerrar} ancho="lg">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <form.Field name="nombre" validators={{ onChange: largo(2, 150, 'El nombre') }}>
            {(field) => (
              <FormField id={field.name} label="Nombre *" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
                <Input
                  id={field.name}
                  autoFocus
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  invalido={field.state.meta.isTouched && !field.state.meta.isValid}
                />
              </FormField>
            )}
          </form.Field>
        </div>

        <div className="sm:col-span-2">
          <form.Field name="descripcion" validators={{ onChange: largoMaximo(1000) }}>
            {(field) => (
              <FormField id={field.name} label="Descripción" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched} ayuda="Opcional">
                <textarea
                  id={field.name}
                  rows={2}
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="input resize-none"
                />
              </FormField>
            )}
          </form.Field>
        </div>

        <form.Field name="categoria_id" validators={{ onChange: seleccionObligatoria('una categoría') }}>
          {(field) => (
            <FormField id={field.name} label="Categoría *" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
              <select
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={`input ${field.state.meta.isTouched && !field.state.meta.isValid ? 'input-error' : ''}`}
              >
                <option value={0}>Elegí una categoría…</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="precio_base" validators={{ onChange: numeroMinimo(0, 'El precio') }}>
          {(field) => (
            <FormField id={field.name} label="Precio *" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
              <Input
                id={field.name}
                type="number"
                min={0}
                step="0.01"
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                invalido={field.state.meta.isTouched && !field.state.meta.isValid}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: enteroMinimo(0, 'El stock') }}>
          {(field) => (
            <FormField id={field.name} label="Stock *" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched}>
              <Input
                id={field.name}
                type="number"
                min={0}
                step={1}
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
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
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

        <div className="sm:col-span-2">
          <form.Field name="imagen_url" validators={{ onChange: largoMaximo(500) }}>
            {(field) => (
              <FormField id={field.name} label="URL de la imagen" errores={field.state.meta.errors} mostrarErrores={field.state.meta.isTouched} ayuda="Opcional. Ej: https://…/foto.jpg">
                <Input
                  id={field.name}
                  type="url"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </FormField>
            )}
          </form.Field>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}

        <form.Subscribe selector={(s) => s.canSubmit}>
          {(puedeEnviar) => (
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variante="secundario" onClick={onCerrar} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!puedeEnviar} cargando={guardando}>
                {esEdicion ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  )
}

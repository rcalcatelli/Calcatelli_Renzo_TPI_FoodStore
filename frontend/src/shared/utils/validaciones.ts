// Validadores para TanStack Form: devuelven el mensaje de error o undefined.
// Repiten las reglas de los schemas del backend para avisar antes de enviar.

type Validador<T> = ({ value }: { value: T }) => string | undefined

export const largo =
  (min: number, max: number, campo = 'Este campo'): Validador<string> =>
  ({ value }) => {
    const texto = value.trim()
    if (min > 0 && !texto) return `${campo} es obligatorio`
    if (texto.length < min) return `Debe tener al menos ${min} caracteres`
    if (texto.length > max) return `Máximo ${max} caracteres`
    return undefined
  }

export const largoMaximo =
  (max: number): Validador<string | null> =>
  ({ value }) =>
    (value ?? '').length > max ? `Máximo ${max} caracteres` : undefined

export const emailValido: Validador<string> = ({ value }) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : 'Ingresá un email válido'

export const numeroMinimo =
  (min: number, campo: string): Validador<number> =>
  ({ value }) => {
    if (Number.isNaN(value)) return `${campo} es obligatorio`
    return value < min ? `${campo} debe ser mayor o igual a ${min}` : undefined
  }

export const enteroMinimo =
  (min: number, campo: string): Validador<number> =>
  ({ value }) =>
    numeroMinimo(min, campo)({ value }) ?? (Number.isInteger(value) ? undefined : `${campo} debe ser un número entero`)

export const seleccionObligatoria =
  (campo: string): Validador<number> =>
  ({ value }) =>
    value > 0 ? undefined : `Elegí ${campo}`

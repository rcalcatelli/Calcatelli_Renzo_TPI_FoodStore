import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  errores: unknown[]
  mostrarErrores: boolean
  ayuda?: string
  children: ReactNode
}

// Label + control + mensajes de error de TanStack Form (field.state.meta.errors es un array)
export function FormField({ id, label, errores, mostrarErrores, ayuda, children }: FormFieldProps) {
  const visibles = mostrarErrores ? errores.filter(Boolean).map(String) : []

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {visibles.length > 0
        ? visibles.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600">
              {error}
            </p>
          ))
        : ayuda && <p className="mt-1 text-xs text-slate-400">{ayuda}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalido?: boolean
}

export function Input({ invalido = false, className = '', ...props }: InputProps) {
  return <input className={`input ${invalido ? 'input-error' : ''} ${className}`} {...props} />
}

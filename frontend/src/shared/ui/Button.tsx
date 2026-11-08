import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'exito' | 'fantasma'
type Tamano = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white shadow-sm hover:bg-orange-700 focus-visible:ring-orange-400',
  secundario: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-300',
  peligro: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400',
  exito: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400',
  fantasma: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  )
}

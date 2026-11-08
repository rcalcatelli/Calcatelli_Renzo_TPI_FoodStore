import type { ReactNode } from 'react'

interface PageHeaderProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function PageHeader({ titulo, descripcion, accion }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {accion}
    </div>
  )
}

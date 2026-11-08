import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number // empieza en 0
  totalPaginas: number
  onCambiar: (pagina: number) => void
  deshabilitado?: boolean
}

export function Paginacion({ pagina, totalPaginas, onCambiar, deshabilitado = false }: PaginacionProps) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3">
      <Button variante="secundario" onClick={() => onCambiar(pagina - 1)} disabled={deshabilitado || pagina === 0}>
        Anterior
      </Button>
      <span className="text-sm text-slate-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        onClick={() => onCambiar(pagina + 1)}
        disabled={deshabilitado || pagina >= totalPaginas - 1}
      >
        Siguiente
      </Button>
    </nav>
  )
}

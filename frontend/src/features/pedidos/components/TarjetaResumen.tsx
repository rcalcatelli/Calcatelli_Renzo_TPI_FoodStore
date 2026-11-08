import { Card } from '../../../shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string
  detalle?: string
  acento: string // clase de color del borde izquierdo
}

export function TarjetaResumen({ titulo, valor, detalle, acento }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 p-5 ${acento}`}>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-400">{detalle}</p>}
    </Card>
  )
}

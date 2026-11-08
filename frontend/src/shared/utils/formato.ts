const PRECIO = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })
const FECHA = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export function formatearPrecio(valor: number): string {
  return PRECIO.format(valor)
}

export function formatearFecha(iso: string): string {
  return FECHA.format(new Date(iso))
}

const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formatoNumero = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 2,
})

export function moneda(valor: number): string {
  const seguro = Number.isFinite(valor) ? valor : 0
  return formatoMoneda.format(seguro)
}

export function fecha(iso: string): string {
  if (!iso) return '—'
  const valor = new Date(iso)
  if (Number.isNaN(valor.getTime())) return iso
  return formatoFecha.format(valor)
}

export function numero(valor: number): string {
  return formatoNumero.format(Number.isFinite(valor) ? valor : 0)
}

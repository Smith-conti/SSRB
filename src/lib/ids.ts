/** Genera IDs correlativos tipo BCH-0001, ORD-0002, etc. */
export function siguienteId(prefijo: string, existentes: string[]): string {
  const patron = new RegExp(`^${prefijo}-(\\d+)$`)
  const maximo = existentes.reduce((max, id) => {
    const coincidencia = id.match(patron)
    if (!coincidencia) return max
    const numero = Number(coincidencia[1])
    return Number.isFinite(numero) ? Math.max(max, numero) : max
  }, 0)
  return `${prefijo}-${String(maximo + 1).padStart(4, '0')}`
}

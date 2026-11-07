import type { Ajustes, EstadoBache, Orden, Prioridad } from '../types'

/** Redondea a dos decimales para que el costo coincida con el cálculo manual. */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/**
 * RF-04: 1 a 3 → baja, 4 a 7 → media, 8 a 10 → alta.
 * Lanza un error si el tamaño no es un entero entre 1 y 10.
 */
export function calcularPrioridad(tamano: number): Prioridad {
  if (!Number.isInteger(tamano) || tamano < 1 || tamano > 10) {
    throw new Error('El tamaño del bache debe ser un entero entre 1 y 10.')
  }
  if (tamano <= 3) return 'baja'
  if (tamano <= 7) return 'media'
  return 'alta'
}

export interface DesgloseCosto {
  manoObra: number
  material: number
  equipamiento: number
  total: number
}

/**
 * RF-07: costo = horas × personas × tarifa por hora
 *                + m³ de material × costo por m³
 *                + costo de equipamiento (si la orden tiene equipamiento asignado).
 */
export function desglosarCosto(
  orden: Pick<Orden, 'horas' | 'personas' | 'materialM3' | 'equipamiento'>,
  ajustes: Ajustes,
): DesgloseCosto {
  const horas = Number.isFinite(orden.horas) ? Math.max(0, orden.horas) : 0
  const personas = Number.isFinite(orden.personas) ? Math.max(0, orden.personas) : 0
  const materialM3 = Number.isFinite(orden.materialM3)
    ? Math.max(0, orden.materialM3)
    : 0
  const tieneEquipamiento = Array.isArray(orden.equipamiento) && orden.equipamiento.length > 0

  const manoObra = horas * personas * ajustes.tarifaHora
  const material = materialM3 * ajustes.costoMaterialM3
  const equipamiento = tieneEquipamiento ? ajustes.costoEquipamiento : 0

  return {
    manoObra: redondear2(manoObra),
    material: redondear2(material),
    equipamiento: redondear2(equipamiento),
    total: redondear2(manoObra + material + equipamiento),
  }
}

export function calcularCosto(
  orden: Pick<Orden, 'horas' | 'personas' | 'materialM3' | 'equipamiento'>,
  ajustes: Ajustes,
): number {
  return desglosarCosto(orden, ajustes).total
}

/**
 * Transiciones válidas del estado de un bache:
 * No reparado → En proceso → Reparado | Reparación temporal | No reparado
 * Reparación temporal → En proceso (con una nueva orden)
 * Reparado es terminal.
 */
export const TRANSICIONES: Record<EstadoBache, readonly EstadoBache[]> = {
  no_reparado: ['en_proceso'],
  en_proceso: ['reparado', 'reparacion_temporal', 'no_reparado'],
  reparado: [],
  reparacion_temporal: ['en_proceso'],
}

export function puedeTransicionar(desde: EstadoBache, hacia: EstadoBache): boolean {
  return TRANSICIONES[desde].includes(hacia)
}

export function transicionesDisponibles(desde: EstadoBache): readonly EstadoBache[] {
  return TRANSICIONES[desde]
}

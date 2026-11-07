import type { Bache, Rol } from '../types'

/** RNF-02: nombre, dirección y teléfono solo para Personal y Supervisor. */
export function puedeVerDatosPersonales(rol: Rol): boolean {
  return rol === 'personal' || rol === 'supervisor'
}

/** RF-01: el ciudadano y el personal pueden registrar baches. */
export function puedeReportarBache(rol: Rol): boolean {
  return rol === 'ciudadano' || rol === 'personal'
}

/** RF-05: el personal crea las órdenes de trabajo. */
export function puedeCrearOrden(rol: Rol): boolean {
  return rol === 'personal'
}

/** El equipo registra avances y cierra órdenes; el personal también puede hacerlo. */
export function puedeEditarOrden(rol: Rol): boolean {
  return rol === 'personal' || rol === 'equipo'
}

export function puedeVerOrdenes(rol: Rol): boolean {
  return rol === 'personal' || rol === 'equipo' || rol === 'supervisor'
}

/** RF-08: el ciudadano y el personal registran reclamos de daños. */
export function puedeRegistrarDano(rol: Rol): boolean {
  return rol === 'ciudadano' || rol === 'personal'
}

/** RNF-02: el ciudadano solo ve sus propios reportes y reclamos. */
export function puedeVerBache(
  rol: Rol,
  bache: Bache,
  ciudadanoActualId: string | undefined,
): boolean {
  if (rol === 'ciudadano') return Boolean(bache.ciudadanoId && bache.ciudadanoId === ciudadanoActualId)
  return true
}

export function puedeVerDanos(rol: Rol): boolean {
  return rol === 'personal' || rol === 'supervisor' || rol === 'ciudadano'
}

export function bachesVisibles(
  rol: Rol,
  baches: Bache[],
  ciudadanoActualId: string | undefined,
): Bache[] {
  if (rol !== 'ciudadano') return baches
  return baches.filter((bache) => bache.ciudadanoId === ciudadanoActualId)
}

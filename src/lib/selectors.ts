import type { Ajustes, Bache, Ciudadano, Dano, Orden } from '../types'
import { calcularCosto } from './rules'

export function nombreCiudadano(
  ciudadanos: Ciudadano[],
  ciudadanoId: string | undefined,
): string | undefined {
  if (!ciudadanoId) return undefined
  return ciudadanos.find((ciudadano) => ciudadano.id === ciudadanoId)?.nombre
}

export function telefonoCiudadano(
  ciudadanos: Ciudadano[],
  ciudadanoId: string | undefined,
): string | undefined {
  if (!ciudadanoId) return undefined
  return ciudadanos.find((ciudadano) => ciudadano.id === ciudadanoId)?.telefono
}

export function ordenesDeBache(ordenes: Orden[], bacheId: string): Orden[] {
  return ordenes
    .filter((orden) => orden.bacheId === bacheId)
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
}

export function costoBache(
  bacheId: string,
  ordenes: Orden[],
  ajustes: Ajustes,
): number {
  return ordenes
    .filter((orden) => orden.bacheId === bacheId)
    .reduce((total, orden) => total + calcularCosto(orden, ajustes), 0)
}

export function costoTotal(ordenes: Orden[], ajustes: Ajustes): number {
  return ordenes.reduce((total, orden) => total + calcularCosto(orden, ajustes), 0)
}

export function danosDeBache(danos: Dano[], bacheId: string): Dano[] {
  return danos.filter((dano) => dano.bacheId === bacheId)
}

export function totalDanos(danos: Dano[]): number {
  return danos.reduce((total, dano) => total + dano.monto, 0)
}

export function nombreEquipo(
  equipos: { id: string; nombre: string }[],
  equipoId: string,
): string {
  return equipos.find((equipo) => equipo.id === equipoId)?.nombre ?? 'Equipo eliminado'
}

export function bacheEtiqueta(bache: Bache): string {
  return `${bache.id} · ${bache.direccion}`
}

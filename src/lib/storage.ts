export const CLAVES = {
  baches: 'ssrb:baches',
  ordenes: 'ssrb:ordenes',
  danos: 'ssrb:danos',
  ciudadanos: 'ssrb:ciudadanos',
  equipos: 'ssrb:equipos',
  ajustes: 'ssrb:ajustes',
  rol: 'ssrb:rol',
  ciudadanoActual: 'ssrb:ciudadanoActual',
} as const

const CLAVES_DATOS = [
  CLAVES.baches,
  CLAVES.ordenes,
  CLAVES.danos,
  CLAVES.ciudadanos,
  CLAVES.equipos,
  CLAVES.ajustes,
]

function almacenamientoDisponible(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

export function leerJSON<T>(clave: string, respaldo: T): T {
  if (!almacenamientoDisponible()) return respaldo
  try {
    const crudo = window.localStorage.getItem(clave)
    if (crudo === null) return respaldo
    return JSON.parse(crudo) as T
  } catch {
    return respaldo
  }
}

export function escribirJSON(clave: string, valor: unknown): boolean {
  if (!almacenamientoDisponible()) return false
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export function borrarDatosDemo(): void {
  if (!almacenamientoDisponible()) return
  try {
    CLAVES_DATOS.forEach((clave) => window.localStorage.removeItem(clave))
  } catch {
    // Sin localStorage no hay nada que borrar.
  }
}

export function descargarArchivo(nombre: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function nombreArchivoExportado(): string {
  const hoy = new Date().toISOString().slice(0, 10)
  return `ssrb-datos-${hoy}.json`
}

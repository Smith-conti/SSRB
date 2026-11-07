export interface Calle {
  nombre: string
  distrito: string
}

/** Catálogo local de calles de la ciudad ficticia de Villa Nueva. */
export const CALLES: Calle[] = [
  { nombre: 'Av. Central', distrito: 'Centro' },
  { nombre: 'Calle 1 de Mayo', distrito: 'Centro' },
  { nombre: 'Calle San José', distrito: 'Centro' },
  { nombre: 'Av. del Parque', distrito: 'Centro' },
  { nombre: 'Av. de los Álamos', distrito: 'Norte' },
  { nombre: 'Calle Los Pinos', distrito: 'Norte' },
  { nombre: 'Calle Las Begonias', distrito: 'Norte' },
  { nombre: 'Av. San Martín', distrito: 'Sur' },
  { nombre: 'Calle Las Acacias', distrito: 'Sur' },
  { nombre: 'Calle El Progreso', distrito: 'Sur' },
  { nombre: 'Av. Los Andes', distrito: 'Este' },
  { nombre: 'Calle El Mirador', distrito: 'Este' },
  { nombre: 'Calle Los Cedros', distrito: 'Este' },
  { nombre: 'Av. del Trabajo', distrito: 'Oeste' },
  { nombre: 'Calle La Ribera', distrito: 'Oeste' },
  { nombre: 'Calle Los Olivos', distrito: 'Oeste' },
]

export const DISTRITOS = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'] as const

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function buscarCalle(nombre: string): Calle | undefined {
  const buscado = normalizar(nombre)
  return CALLES.find((calle) => normalizar(calle.nombre) === buscado)
}

export function distritoDeCalle(nombre: string): string | undefined {
  return buscarCalle(nombre)?.distrito
}

export function sugerirCalles(consulta: string, limite = 8): Calle[] {
  const buscado = normalizar(consulta)
  if (!buscado) return CALLES.slice(0, limite)
  return CALLES.filter((calle) => normalizar(calle.nombre).includes(buscado)).slice(
    0,
    limite,
  )
}

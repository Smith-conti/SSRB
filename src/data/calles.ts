export interface Calle {
  nombre: string
  distrito: string
}

/** Catálogo local de calles y avenidas de la ciudad de Cusco. */
export const CALLES: Calle[] = [
  // Centro Histórico
  { nombre: 'Av. El Sol', distrito: 'Centro Histórico' },
  { nombre: 'Av. Garcilaso de la Vega', distrito: 'Centro Histórico' },
  { nombre: 'Calle Plateros', distrito: 'Centro Histórico' },
  { nombre: 'Av. Tullumayo', distrito: 'Centro Histórico' },

  // Wanchaq
  { nombre: 'Av. de la Cultura', distrito: 'Wanchaq' },
  { nombre: 'Av. Ayacucho', distrito: 'Wanchaq' },
  { nombre: 'Av. 28 de Julio', distrito: 'Wanchaq' },

  // Santiago
  { nombre: 'Av. Huayruropata', distrito: 'Santiago' },
  { nombre: 'Av. La Paz', distrito: 'Santiago' },
  { nombre: 'Av. 24 de Junio', distrito: 'Santiago' },

  // San Sebastián
  { nombre: 'Av. Cusco', distrito: 'San Sebastián' },
  { nombre: 'Av. Marcavalle', distrito: 'San Sebastián' },
  { nombre: 'Calle Los Cipreses', distrito: 'San Sebastián' },

  // San Jerónimo
  { nombre: 'Av. San Jerónimo', distrito: 'San Jerónimo' },
  { nombre: 'Av. Los Álamos', distrito: 'San Jerónimo' },
  { nombre: 'Calle Manco Cápac', distrito: 'San Jerónimo' },
]

export const DISTRITOS = [
  'Centro Histórico',
  'Wanchaq',
  'Santiago',
  'San Sebastián',
  'San Jerónimo',
] as const

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

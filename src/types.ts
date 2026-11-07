export type Rol = 'ciudadano' | 'personal' | 'equipo' | 'supervisor'

export type Prioridad = 'baja' | 'media' | 'alta'

export type EstadoBache =
  | 'no_reparado'
  | 'en_proceso'
  | 'reparado'
  | 'reparacion_temporal'

export type PosicionVia = 'medio' | 'cuneta' | 'acera' | 'borde'

export type TipoDano =
  | 'llanta'
  | 'suspension'
  | 'parabrisas'
  | 'carroceria'
  | 'otro'

export type ResultadoOrden = 'reparado' | 'reparacion_temporal' | 'no_reparado'

export type EstadoOrden = 'abierta' | 'cerrada'

export interface Ciudadano {
  id: string
  nombre: string
  telefono: string
  correo?: string
}

export interface Equipo {
  id: string
  nombre: string
  personas: number
  equipamiento: string[]
}

export interface Ajustes {
  tarifaHora: number
  costoMaterialM3: number
  costoEquipamiento: number
}

export interface Bache {
  id: string
  calle: string
  altura: string
  direccion: string
  distrito: string
  tamano: number
  posicion: PosicionVia
  prioridad: Prioridad
  estado: EstadoBache
  reportadoPor: 'ciudadano' | 'personal'
  ciudadanoId?: string
  notas?: string
  fechaReporte: string
}

export interface Orden {
  id: string
  bacheId: string
  equipoId: string
  personas: number
  equipamiento: string[]
  horas: number
  materialM3: number
  estado: EstadoOrden
  resultado?: ResultadoOrden
  observaciones?: string
  fechaCreacion: string
  fechaCierre?: string
}

export interface Dano {
  id: string
  bacheId: string
  ciudadanoId?: string
  nombre: string
  direccion: string
  telefono: string
  tipo: TipoDano
  monto: number
  fecha: string
}

export interface AppData {
  baches: Bache[]
  ordenes: Orden[]
  danos: Dano[]
  ciudadanos: Ciudadano[]
  equipos: Equipo[]
  ajustes: Ajustes
}

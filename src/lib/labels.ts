import type {
  EstadoBache,
  EstadoOrden,
  PosicionVia,
  Prioridad,
  ResultadoOrden,
  Rol,
  TipoDano,
} from '../types'

export const ROLES: { value: Rol; label: string; descripcion: string }[] = [
  {
    value: 'ciudadano',
    label: 'Ciudadano',
    descripcion: 'Reporta baches y consulta el estado de sus reportes.',
  },
  {
    value: 'personal',
    label: 'Personal de obras públicas',
    descripcion: 'Gestiona reportes, órdenes de trabajo y reclamos de daños.',
  },
  {
    value: 'equipo',
    label: 'Equipo de reparación',
    descripcion: 'Registra horas, materiales y el resultado de las reparaciones.',
  },
  {
    value: 'supervisor',
    label: 'Supervisor',
    descripcion: 'Consulta indicadores, tarifas y la configuración de la demo.',
  },
]

export const ROL_LABELS: Record<Rol, string> = {
  ciudadano: 'Ciudadano',
  personal: 'Personal de obras públicas',
  equipo: 'Equipo de reparación',
  supervisor: 'Supervisor',
}

export const ESTADOS_BACHE: EstadoBache[] = [
  'no_reparado',
  'en_proceso',
  'reparado',
  'reparacion_temporal',
]

export const ESTADO_LABELS: Record<EstadoBache, string> = {
  no_reparado: 'No reparado',
  en_proceso: 'Trabajo en proceso',
  reparado: 'Reparado',
  reparacion_temporal: 'Reparación temporal',
}

export const ESTADO_BADGE: Record<EstadoBache, string> = {
  no_reparado: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  en_proceso: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  reparado: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  reparacion_temporal: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
}

export const ESTADO_DOT: Record<EstadoBache, string> = {
  no_reparado: 'bg-rose-500',
  en_proceso: 'bg-amber-500',
  reparado: 'bg-emerald-500',
  reparacion_temporal: 'bg-indigo-500',
}

export const ESTADO_COLOR: Record<EstadoBache, string> = {
  no_reparado: '#f43f5e',
  en_proceso: '#f59e0b',
  reparado: '#10b981',
  reparacion_temporal: '#6366f1',
}

export const PRIORIDADES: Prioridad[] = ['alta', 'media', 'baja']

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}

export const PRIORIDAD_BADGE: Record<Prioridad, string> = {
  baja: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  media: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  alta: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
}

export const PRIORIDAD_COLOR: Record<Prioridad, string> = {
  baja: '#10b981',
  media: '#f59e0b',
  alta: '#f43f5e',
}

export const POSICIONES: PosicionVia[] = ['medio', 'cuneta', 'acera', 'borde']

export const POSICION_LABELS: Record<PosicionVia, string> = {
  medio: 'Medio de la calle',
  cuneta: 'Cuneta',
  acera: 'Acera',
  borde: 'Borde de la calzada',
}

export const TIPOS_DANO: TipoDano[] = [
  'llanta',
  'suspension',
  'parabrisas',
  'carroceria',
  'otro',
]

export const TIPO_DANO_LABELS: Record<TipoDano, string> = {
  llanta: 'Llanta',
  suspension: 'Suspensión',
  parabrisas: 'Parabrisas',
  carroceria: 'Carrocería',
  otro: 'Otro',
}

export const RESULTADO_LABELS: Record<ResultadoOrden, string> = {
  reparado: 'Reparado',
  reparacion_temporal: 'Reparación temporal',
  no_reparado: 'No se pudo reparar',
}

export const ESTADO_ORDEN_LABELS: Record<EstadoOrden, string> = {
  abierta: 'Abierta',
  cerrada: 'Cerrada',
}

export const EQUIPAMIENTO_OPCIONES = [
  'Motoniveladora',
  'Compactador',
  'Camión volquete',
  'Retroexcavadora',
  'Cortadora de asfalto',
  'Señalización',
] as const

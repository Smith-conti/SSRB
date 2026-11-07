import type { ReactNode } from 'react'
import {
  ESTADO_BADGE,
  ESTADO_LABELS,
  ESTADO_ORDEN_LABELS,
  PRIORIDAD_BADGE,
  PRIORIDAD_LABELS,
} from '../lib/labels'
import type { EstadoBache, EstadoOrden, Prioridad } from '../types'

export function Badge({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  )
}

export function EstadoBadge({ estado }: { estado: EstadoBache }) {
  return <Badge className={ESTADO_BADGE[estado]}>{ESTADO_LABELS[estado]}</Badge>
}

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  return (
    <Badge className={PRIORIDAD_BADGE[prioridad]}>
      {PRIORIDAD_LABELS[prioridad]}
    </Badge>
  )
}

export function EstadoOrdenBadge({ estado }: { estado: EstadoOrden }) {
  const clase =
    estado === 'abierta'
      ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  return <Badge className={clase}>{ESTADO_ORDEN_LABELS[estado]}</Badge>
}

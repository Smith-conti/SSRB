import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

const TONOS = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
} as const

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'indigo',
  hint,
}: {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone?: keyof typeof TONOS
  hint?: string
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONOS[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

import { CircleAlert, CircleCheck, Info, MapPin, Phone, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, PrioridadBadge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { CALLES, distritoDeCalle, sugerirCalles } from '../data/calles'
import {
  POSICIONES,
  POSICION_LABELS,
  PRIORIDAD_BADGE,
  PRIORIDAD_LABELS,
} from '../lib/labels'
import { calcularPrioridad } from '../lib/rules'
import type { Bache, PosicionVia } from '../types'

export function ReportarBache() {
  const { rol, ciudadanoActual, addBache } = useApp()
  const [calle, setCalle] = useState('')
  const [altura, setAltura] = useState('')
  const [tamano, setTamano] = useState(5)
  const [posicion, setPosicion] = useState<PosicionVia>('medio')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')
  const [creado, setCreado] = useState<Bache | null>(null)

  const distrito = distritoDeCalle(calle)
  const prioridad = calcularPrioridad(tamano)
  const sugerencias = sugerirCalles(calle).slice(0, 5)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    const resultado = addBache({ calle, altura, tamano, posicion, notas })
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    setCreado(resultado.data)
    setCalle('')
    setAltura('')
    setTamano(5)
    setPosicion('medio')
    setNotas('')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Nuevo reporte"
        title="Reportar un bache"
        description="Completa los datos del bache. El distrito y la prioridad se calculan automáticamente."
      />

      {creado ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CircleCheck size={22} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">
                Bache {creado.id} registrado correctamente
              </p>
              <p className="mt-0.5 text-sm text-emerald-800">
                {creado.direccion} · {creado.distrito} · Prioridad{' '}
                {PRIORIDAD_LABELS[creado.prioridad].toLowerCase()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/baches/${creado.id}`} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                  Ver detalle
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCreado(null)}
                >
                  Reportar otro
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={enviar} className="card p-5 sm:p-6 lg:col-span-2">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div>
                <label className="label" htmlFor="calle">
                  Calle <span className="text-rose-500">*</span>
                </label>
                <input
                  id="calle"
                  className="input"
                  list="catalogo-calles"
                  value={calle}
                  onChange={(evento) => setCalle(evento.target.value)}
                  placeholder="Ej.: Av. El Sol"
                  autoComplete="off"
                  required
                />
                <datalist id="catalogo-calles">
                  {CALLES.map((item) => (
                    <option key={item.nombre} value={item.nombre}>
                      {item.distrito}
                    </option>
                  ))}
                </datalist>
                {calle && !distrito ? (
                  <div className="mt-2">
                    <p className="flex items-center gap-1.5 text-xs text-amber-700">
                      <CircleAlert size={13} />
                      Selecciona una calle del catálogo.
                    </p>
                    {sugerencias.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sugerencias.map((item) => (
                          <button
                            key={item.nombre}
                            type="button"
                            onClick={() => setCalle(item.nombre)}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            {item.nombre}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : distrito ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <MapPin size={13} />
                    Distrito detectado: {distrito}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="label" htmlFor="altura">
                  Altura / número <span className="text-rose-500">*</span>
                </label>
                <input
                  id="altura"
                  className="input"
                  value={altura}
                  onChange={(evento) => setAltura(evento.target.value)}
                  placeholder="Ej.: 450"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-3">
                <label className="label mb-0" htmlFor="tamano">
                  Tamaño del bache (1 a 10) <span className="text-rose-500">*</span>
                </label>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-700">
                  {tamano}/10
                </span>
              </div>
              <input
                id="tamano"
                type="range"
                min={1}
                max={10}
                step={1}
                value={tamano}
                onChange={(evento) => setTamano(Number(evento.target.value))}
                className="mt-3 w-full accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>Pequeño</span>
                <span>Grande</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <span>Prioridad calculada:</span>
                <PrioridadBadge prioridad={prioridad} />
                <span className="text-xs text-slate-500">
                  (1-3 baja · 4-7 media · 8-10 alta)
                </span>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="posicion">
                Posición en la vía <span className="text-rose-500">*</span>
              </label>
              <select
                id="posicion"
                className="input"
                value={posicion}
                onChange={(evento) => setPosicion(evento.target.value as PosicionVia)}
                required
              >
                {POSICIONES.map((item) => (
                  <option key={item} value={item}>
                    {POSICION_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="notas">
                Notas adicionales <span className="text-slate-400">(opcional)</span>
              </label>
              <textarea
                id="notas"
                className="input min-h-20"
                value={notas}
                onChange={(evento) => setNotas(evento.target.value)}
                placeholder="Ej.: el bache está junto a un colegio y genera desvíos…"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Al registrar, el bache queda en estado «No reparado».
              </p>
              <button type="submit" className="btn-primary">
                Registrar bache
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">
              {rol === 'ciudadano' ? 'Tus datos de contacto' : 'Registro interno'}
            </h2>
            {rol === 'ciudadano' && ciudadanoActual ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <User size={15} className="text-slate-400" />
                  <span className="font-medium text-slate-900">
                    {ciudadanoActual.nombre}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  {ciudadanoActual.telefono}
                </p>
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  Tus datos personales solo se muestran al personal de obras públicas
                  y al supervisor.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                El reporte quedará registrado como personal de obras públicas. No se
                solicitan datos personales del ciudadano.
              </p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Vista previa</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Dirección</dt>
                <dd className="text-right font-medium text-slate-900">
                  {calle ? `${calle} ${altura}`.trim() : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Distrito</dt>
                <dd className="font-medium text-slate-900">{distrito ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Tamaño</dt>
                <dd className="font-medium text-slate-900">{tamano}/10</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Prioridad</dt>
                <dd>
                  <Badge className={PRIORIDAD_BADGE[prioridad]}>
                    {PRIORIDAD_LABELS[prioridad]}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Posición</dt>
                <dd className="text-right font-medium text-slate-900">
                  {POSICION_LABELS[posicion]}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-5 text-sm text-slate-600">
            <h2 className="text-sm font-bold text-slate-900">Catálogo de calles</h2>
            <p className="mt-2">
              La ciudad de Cusco tiene {CALLES.length} calles y avenidas
              catalogadas en 5 distritos.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Si la calle no aparece en el autocompletado, no se puede determinar el
              distrito.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { moneda } from '../lib/format'
import { RESULTADO_LABELS } from '../lib/labels'
import { desglosarCosto } from '../lib/rules'
import { nombreEquipo } from '../lib/selectors'
import type { ResultadoOrden } from '../types'
import { EstadoBadge } from './Badge'
import { Modal } from './Modal'

export function AvanceForm({
  open,
  onClose,
  ordenId,
}: {
  open: boolean
  onClose: () => void
  ordenId: string | null
}) {
  const { ordenes, baches, equipos, ajustes, actualizarOrden, cerrarOrden } = useApp()
  const [horas, setHoras] = useState('0')
  const [materialM3, setMaterialM3] = useState('0')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')

  const orden = ordenes.find((item) => item.id === ordenId)
  const bache = orden ? baches.find((item) => item.id === orden.bacheId) : undefined

  useEffect(() => {
    if (!open || !orden) return
    setHoras(String(orden.horas))
    setMaterialM3(String(orden.materialM3))
    setObservaciones(orden.observaciones ?? '')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ordenId])

  if (!orden) return null

  const ordenActual = orden
  const horasNumero = Number(horas)
  const materialNumero = Number(materialM3)
  const desglose = desglosarCosto(
    {
      horas: Number.isFinite(horasNumero) ? horasNumero : 0,
      personas: orden.personas,
      materialM3: Number.isFinite(materialNumero) ? materialNumero : 0,
      equipamiento: orden.equipamiento,
    },
    ajustes,
  )

  function guardar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    const resultado = actualizarOrden(ordenActual.id, {
      horas: Number(horas),
      materialM3: Number(materialM3),
      observaciones,
    })
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    onClose()
  }

  function finalizar(resultado: ResultadoOrden) {
    const confirmado = window.confirm(
      `¿Cerrar la orden y marcar el bache como «${RESULTADO_LABELS[resultado]}»? Esta acción actualiza el estado del bache.`,
    )
    if (!confirmado) return
    setError('')
    const respuesta = cerrarOrden(ordenActual.id, resultado, {
      horas: Number(horas),
      materialM3: Number(materialM3),
      observaciones,
    })
    if (!respuesta.ok) {
      setError(respuesta.error)
      return
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Avance de ${orden.id}`}
      description="Registra horas y material; luego guarda el avance o cierra la orden con un resultado."
    >
      <form onSubmit={guardar} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">
              {bache ? `${bache.id} · ${bache.direccion}` : orden.bacheId}
            </span>
            {bache ? <EstadoBadge estado={bache.estado} /> : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {nombreEquipo(equipos, orden.equipoId)} · {orden.personas}{' '}
            {orden.personas === 1 ? 'persona' : 'personas'} ·{' '}
            {orden.equipamiento.length > 0
              ? orden.equipamiento.join(', ')
              : 'Sin equipamiento'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="avance-horas">
              Horas dedicadas <span className="text-rose-500">*</span>
            </label>
            <input
              id="avance-horas"
              type="number"
              min={0}
              max={1000}
              step={0.5}
              className="input"
              value={horas}
              onChange={(evento) => setHoras(evento.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="avance-material">
              Material de relleno (m³) <span className="text-rose-500">*</span>
            </label>
            <input
              id="avance-material"
              type="number"
              min={0}
              max={10000}
              step={0.1}
              className="input"
              value={materialM3}
              onChange={(evento) => setMaterialM3(evento.target.value)}
              required
            />
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-indigo-900">Costo calculado</span>
            <span className="text-lg font-bold text-indigo-700">
              {moneda(desglose.total)}
            </span>
          </div>
          <dl className="mt-2 grid gap-1 text-xs text-indigo-900/80 sm:grid-cols-3">
            <div className="flex justify-between gap-2 sm:block">
              <dt>Mano de obra</dt>
              <dd className="font-semibold">{moneda(desglose.manoObra)}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt>Material</dt>
              <dd className="font-semibold">{moneda(desglose.material)}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt>Equipamiento</dt>
              <dd className="font-semibold">{moneda(desglose.equipamiento)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <label className="label" htmlFor="avance-observaciones">
            Observaciones <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="avance-observaciones"
            className="input min-h-20"
            value={observaciones}
            onChange={(evento) => setObservaciones(evento.target.value)}
            placeholder="Detalle del trabajo realizado…"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-secondary">
              Guardar avance
            </button>
            <button
              type="button"
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300"
              onClick={() => finalizar('reparado')}
            >
              Marcar reparado
            </button>
            <button
              type="button"
              className="btn-primary bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-300"
              onClick={() => finalizar('reparacion_temporal')}
            >
              Reparación temporal
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => finalizar('no_reparado')}
            >
              No se pudo reparar
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Cerrar la orden es definitivo: «Reparado» no admite nuevas órdenes. Una
          reparación temporal permite abrir una nueva orden más adelante.
        </p>
      </form>
    </Modal>
  )
}

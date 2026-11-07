import { useEffect, useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { bacheEtiqueta } from '../lib/selectors'
import { EQUIPAMIENTO_OPCIONES } from '../lib/labels'
import type { Bache } from '../types'
import { Modal } from './Modal'
import { EstadoBadge, PrioridadBadge } from './Badge'

export function OrdenForm({
  open,
  onClose,
  bacheFijo,
}: {
  open: boolean
  onClose: () => void
  bacheFijo?: string
}) {
  const { rol, baches, ordenes, equipos, crearOrden } = useApp()
  const [bacheId, setBacheId] = useState('')
  const [equipoId, setEquipoId] = useState('')
  const [personas, setPersonas] = useState(2)
  const [equipamiento, setEquipamiento] = useState<string[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')

  const esElegible = (bache: Bache): boolean =>
    (bache.estado === 'no_reparado' || bache.estado === 'reparacion_temporal') &&
    !ordenes.some(
      (orden) => orden.bacheId === bache.id && orden.estado === 'abierta',
    )

  const elegibles = baches.filter(esElegible)
  const bacheSeleccionado = baches.find((bache) => bache.id === bacheId)
  const bacheFijoValido = bacheFijo
    ? elegibles.some((bache) => bache.id === bacheFijo)
    : true

  useEffect(() => {
    if (!open) return
    const bacheInicial =
      bacheFijo && elegibles.some((bache) => bache.id === bacheFijo)
        ? bacheFijo
        : (elegibles[0]?.id ?? '')
    const equipoInicial = equipos[0]
    setBacheId(bacheInicial)
    setEquipoId(equipoInicial?.id ?? '')
    setPersonas(equipoInicial?.personas ?? 2)
    setEquipamiento(equipoInicial ? [...equipoInicial.equipamiento] : [])
    setObservaciones('')
    setError('')
    // Solo reiniciamos al abrir el modal o cambiar el bache fijado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bacheFijo])

  if (rol !== 'personal') return null

  function cambiarEquipo(id: string) {
    setEquipoId(id)
    const equipo = equipos.find((item) => item.id === id)
    if (equipo) {
      setPersonas(equipo.personas)
      setEquipamiento([...equipo.equipamiento])
    }
  }

  function alternarEquipamiento(nombre: string) {
    setEquipamiento((previo) =>
      previo.includes(nombre)
        ? previo.filter((item) => item !== nombre)
        : [...previo, nombre],
    )
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    if (!bacheId) {
      setError('Selecciona un bache que admita una nueva orden.')
      return
    }
    const resultado = crearOrden({
      bacheId,
      equipoId,
      personas,
      equipamiento,
      observaciones,
    })
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    onClose()
  }

  const bloqueado = elegibles.length === 0 || !bacheFijoValido

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva orden de trabajo"
      description="Asigna un equipo de reparación al bache. Al crear la orden, el bache pasa a Trabajo en proceso."
    >
      <form onSubmit={enviar} className="space-y-4">
        {!bacheFijoValido ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Este bache no admite una nueva orden: ya tiene una orden abierta o está
            reparado.
          </div>
        ) : null}

        {elegibles.length === 0 && bacheFijoValido ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No hay baches disponibles para crear una orden. Deben estar en estado
            «No reparado» o «Reparación temporal» y no tener otra orden abierta.
          </div>
        ) : null}

        <div>
          <label className="label" htmlFor="orden-bache">
            Bache <span className="text-rose-500">*</span>
          </label>
          <select
            id="orden-bache"
            className="input"
            value={bacheId}
            onChange={(evento) => setBacheId(evento.target.value)}
            disabled={bloqueado}
            required
          >
            <option value="">Selecciona un bache…</option>
            {elegibles.map((bache) => (
              <option key={bache.id} value={bache.id}>
                {bacheEtiqueta(bache)} · {bache.distrito}
              </option>
            ))}
          </select>
          {bacheSeleccionado ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <EstadoBadge estado={bacheSeleccionado.estado} />
              <PrioridadBadge prioridad={bacheSeleccionado.prioridad} />
              <span>
                Tamaño {bacheSeleccionado.tamano}/10 · {bacheSeleccionado.distrito}
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="orden-equipo">
              Equipo de reparación <span className="text-rose-500">*</span>
            </label>
            <select
              id="orden-equipo"
              className="input"
              value={equipoId}
              onChange={(evento) => cambiarEquipo(evento.target.value)}
              required
            >
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="orden-personas">
              Cantidad de personas <span className="text-rose-500">*</span>
            </label>
            <input
              id="orden-personas"
              type="number"
              min={1}
              max={50}
              step={1}
              className="input"
              value={personas}
              onChange={(evento) => setPersonas(Number(evento.target.value))}
              required
            />
          </div>
        </div>

        <fieldset>
          <legend className="label">Equipamiento asignado</legend>
          <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            {EQUIPAMIENTO_OPCIONES.map((opcion) => (
              <label
                key={opcion}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={equipamiento.includes(opcion)}
                  onChange={() => alternarEquipamiento(opcion)}
                />
                {opcion}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            El costo del equipamiento se aplica una vez por orden cuando hay al menos
            un equipo asignado.
          </p>
        </fieldset>

        <div>
          <label className="label" htmlFor="orden-observaciones">
            Observaciones <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="orden-observaciones"
            className="input min-h-20"
            value={observaciones}
            onChange={(evento) => setObservaciones(evento.target.value)}
            placeholder="Indicaciones para el equipo de reparación…"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={bloqueado}>
            Crear orden
          </button>
        </div>
      </form>
    </Modal>
  )
}

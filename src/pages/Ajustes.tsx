import {
  CircleCheck,
  Download,
  Info,
  RotateCcw,
  Save,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { moneda } from '../lib/format'

const VALORES_POR_DEFECTO = {
  tarifaHora: 25,
  costoMaterialM3: 60,
  costoEquipamiento: 120,
}

export function Ajustes() {
  const {
    ajustes,
    baches,
    ordenes,
    danos,
    storageOk,
    guardarAjustes,
    exportarDatos,
    restablecerDemo,
  } = useApp()

  const [tarifaHora, setTarifaHora] = useState(String(ajustes.tarifaHora))
  const [costoMaterialM3, setCostoMaterialM3] = useState(
    String(ajustes.costoMaterialM3),
  )
  const [costoEquipamiento, setCostoEquipamiento] = useState(
    String(ajustes.costoEquipamiento),
  )
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    setTarifaHora(String(ajustes.tarifaHora))
    setCostoMaterialM3(String(ajustes.costoMaterialM3))
    setCostoEquipamiento(String(ajustes.costoEquipamiento))
  }, [ajustes])

  function guardar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    setExito('')
    const resultado = guardarAjustes({
      tarifaHora: Number(tarifaHora),
      costoMaterialM3: Number(costoMaterialM3),
      costoEquipamiento: Number(costoEquipamiento),
    })
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    setExito('Tarifas guardadas. Los costos de todas las órdenes se recalculan.')
  }

  function usarValoresPorDefecto() {
    setTarifaHora(String(VALORES_POR_DEFECTO.tarifaHora))
    setCostoMaterialM3(String(VALORES_POR_DEFECTO.costoMaterialM3))
    setCostoEquipamiento(String(VALORES_POR_DEFECTO.costoEquipamiento))
    setError('')
    setExito('')
  }

  function restablecer() {
    const confirmado = window.confirm(
      '¿Restablecer la demo? Se borrarán todos los datos actuales y se volverán a cargar los 12 baches, 3 equipos, órdenes y reclamos de ejemplo.',
    )
    if (!confirmado) return
    restablecerDemo()
    setError('')
    setExito('Demo restablecida con los datos de ejemplo.')
  }

  function exportar() {
    exportarDatos()
    setError('')
    setExito('Se descargó el archivo JSON con todos los datos de la demo.')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Supervisor"
        title="Ajustes de la demo"
        description="Configura las tarifas del cálculo de costos, exporta los datos o restablece la demostración."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <form onSubmit={guardar} className="card p-5 sm:p-6 xl:col-span-2">
          <h2 className="text-base font-bold text-slate-900">Tarifas de reparación</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Solo el supervisor puede modificar estos valores. Se aplican a los
            costos ya registrados y a las nuevas órdenes.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="tarifa-hora">
                Tarifa por hora y persona
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                  S/
                </span>
                <input
                  id="tarifa-hora"
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="input pl-9"
                  value={tarifaHora}
                  onChange={(evento) => setTarifaHora(evento.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="costo-material">
                Costo por m³ de material
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                  S/
                </span>
                <input
                  id="costo-material"
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="input pl-9"
                  value={costoMaterialM3}
                  onChange={(evento) => setCostoMaterialM3(evento.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="costo-equipamiento">
                Equipamiento por orden
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                  S/
                </span>
                <input
                  id="costo-equipamiento"
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="input pl-9"
                  value={costoEquipamiento}
                  onChange={(evento) => setCostoEquipamiento(evento.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-950">
            <p className="font-semibold">Fórmula aplicada (RF-07)</p>
            <p className="mt-1 font-mono text-xs leading-relaxed sm:text-sm">
              costo = horas × personas × {moneda(Number(tarifaHora) || 0)} + m³ ×{' '}
              {moneda(Number(costoMaterialM3) || 0)} +{' '}
              {moneda(Number(costoEquipamiento) || 0)} (si hay equipamiento)
            </p>
            <p className="mt-2 text-xs text-indigo-900/70">
              El costo del equipamiento se aplica una vez por orden cuando la orden
              tiene al menos un equipo asignado.
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {exito ? (
            <p className="mt-4 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CircleCheck size={15} />
              {exito}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              className="btn-secondary"
              onClick={usarValoresPorDefecto}
            >
              Valores por defecto
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              Guardar tarifas
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Datos de la demo</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Baches</dt>
                <dd className="font-semibold text-slate-900">{baches.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Órdenes</dt>
                <dd className="font-semibold text-slate-900">{ordenes.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Reclamos</dt>
                <dd className="font-semibold text-slate-900">{danos.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Almacenamiento</dt>
                <dd
                  className={`font-semibold ${storageOk ? 'text-emerald-700' : 'text-rose-700'}`}
                >
                  {storageOk ? 'Disponible' : 'No disponible'}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Claves usadas: ssrb:baches, ssrb:ordenes, ssrb:danos, ssrb:ciudadanos,
              ssrb:equipos, ssrb:ajustes, ssrb:rol y ssrb:ciudadanoActual.
            </p>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Exportar datos</h2>
            <p className="mt-1 text-xs text-slate-500">
              Descarga un JSON con baches, órdenes, reclamos, ciudadanos, equipos y
              tarifas.
            </p>
            <button type="button" className="btn-secondary mt-3 w-full" onClick={exportar}>
              <Download size={16} />
              Exportar datos
            </button>
          </section>

          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-rose-900">
              <TriangleAlert size={16} />
              Zona de riesgo
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-rose-800">
              Restablece la demo a su estado inicial. Se pierden los reportes,
              órdenes y reclamos creados.
            </p>
            <button type="button" className="btn-danger mt-3 w-full" onClick={restablecer}>
              <RotateCcw size={16} />
              Restablecer demo
            </button>
          </section>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-indigo-500" />
          <p>
            <strong className="text-slate-900">Privacidad:</strong> nombre, dirección
            y teléfono de los ciudadanos solo se muestran al personal y al supervisor.
            El ciudadano ve únicamente sus propios reportes y reclamos.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <Info size={16} className="mt-0.5 shrink-0 text-indigo-500" />
          <p>
            <strong className="text-slate-900">Persistencia:</strong> los datos viven
            en el localStorage de este navegador. Al recargar la página se mantienen;
            no se comparten entre dispositivos.
          </p>
        </div>
      </div>
    </div>
  )
}

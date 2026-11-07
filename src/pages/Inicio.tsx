import {
  ArrowRight,
  ChartColumn,
  ClipboardList,
  CircleDollarSign,
  CircleCheck,
  Clock,
  Construction,
  MapPin,
  Plus,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { moneda, fecha } from '../lib/format'
import { PRIORIDAD_LABELS, ROL_LABELS } from '../lib/labels'
import { bachesVisibles } from '../lib/permissions'
import { costoTotal, nombreEquipo } from '../lib/selectors'
import { EstadoBadge, PrioridadBadge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import type { Rol } from '../types'

const PASOS: Record<Rol, string[]> = {
  ciudadano: [
    'Reporta un bache indicando calle, altura, tamaño y posición.',
    'El sistema asigna el distrito y la prioridad automáticamente.',
    'Consulta el estado de tus reportes desde «Mis reportes».',
    'Si sufriste daños, registra el reclamo en el archivo de daños.',
  ],
  personal: [
    'Revisa los baches reportados y filtra por distrito o prioridad.',
    'Crea una orden de trabajo y asigna un equipo de reparación.',
    'Haz seguimiento a las órdenes abiertas con el equipo.',
    'Registra reclamos de daños con los datos del ciudadano.',
  ],
  equipo: [
    'Abre «Órdenes de trabajo» y revisa las órdenes abiertas.',
    'Registra las horas dedicadas y el material utilizado.',
    'Cierra la orden como reparado, reparación temporal o no reparado.',
    'El costo se calcula automáticamente con las tarifas vigentes.',
  ],
  supervisor: [
    'Consulta el panel con indicadores por estado, prioridad y distrito.',
    'Revisa el costo total de las reparaciones registradas.',
    'Ajusta las tarifas de mano de obra, material y equipamiento.',
    'Exporta los datos o restablece la demo desde Ajustes.',
  ],
}

export function Inicio() {
  const {
    rol,
    baches,
    ordenes,
    danos,
    equipos,
    ajustes,
    ciudadanoActual,
    ciudadanoActualId,
  } = useApp()

  const visibles = bachesVisibles(rol, baches, ciudadanoActualId)
  const sinReparar = visibles.filter((bache) => bache.estado === 'no_reparado').length
  const enProceso = visibles.filter((bache) => bache.estado === 'en_proceso').length
  const reparados = visibles.filter((bache) => bache.estado === 'reparado').length
  const temporales = visibles.filter(
    (bache) => bache.estado === 'reparacion_temporal',
  ).length
  const ordenesAbiertas = ordenes.filter((orden) => orden.estado === 'abierta')
  const danosPropios =
    rol === 'ciudadano'
      ? danos.filter((dano) => dano.ciudadanoId === ciudadanoActualId)
      : []
  const costo = costoTotal(ordenes, ajustes)

  const saludo =
    rol === 'ciudadano' && ciudadanoActual
      ? `Hola, ${ciudadanoActual.nombre.split(' ')[0]}`
      : rol === 'personal'
        ? 'Panel de obras públicas'
        : rol === 'equipo'
          ? 'Equipo de reparación'
          : 'Panel del supervisor'

  const descripcion =
    rol === 'ciudadano'
      ? 'Reporta baches en tu barrio y sigue el estado de tus reclamos. Tus datos personales quedan protegidos.'
      : rol === 'personal'
        ? 'Gestiona los reportes ciudadanos, las órdenes de trabajo y el archivo de daños de Cusco.'
        : rol === 'equipo'
          ? 'Consulta las órdenes asignadas, registra el avance y cierra los trabajos de reparación.'
          : 'Supervisa la operación completa: estado de los baches, costos, distritos y configuración de tarifas.'

  const recientes = [...visibles]
    .sort((a, b) => b.fechaReporte.localeCompare(a.fechaReporte))
    .slice(0, 5)

  const acciones =
    rol === 'ciudadano' ? (
      <>
        <Link to="/reportar" className="btn-primary">
          <Plus size={16} />
          Reportar bache
        </Link>
        <Link to="/baches" className="btn-secondary">
          Ver mis reportes
        </Link>
      </>
    ) : rol === 'personal' ? (
      <>
        <Link to="/baches" className="btn-primary">
          <MapPin size={16} />
          Revisar baches
        </Link>
        <Link to="/reportar" className="btn-secondary">
          <Plus size={16} />
          Registrar bache
        </Link>
      </>
    ) : rol === 'equipo' ? (
      <Link to="/ordenes" className="btn-primary">
        <Wrench size={16} />
        Ver órdenes
      </Link>
    ) : (
      <>
        <Link to="/panel" className="btn-primary">
          <ChartColumn size={16} />
          Abrir panel
        </Link>
        <Link to="/ajustes" className="btn-secondary">
          <Settings size={16} />
          Ajustes
        </Link>
      </>
    )

  return (
    <div>
      <PageHeader
        eyebrow={ROL_LABELS[rol]}
        title={saludo}
        description={descripcion}
        actions={acciones}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rol === 'ciudadano' ? (
          <>
            <StatCard
              label="Mis reportes"
              value={visibles.length}
              icon={MapPin}
              tone="indigo"
            />
            <StatCard
              label="En proceso"
              value={enProceso}
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Reparados"
              value={reparados}
              icon={CircleCheck}
              tone="emerald"
            />
            <StatCard
              label="Mis reclamos"
              value={danosPropios.length}
              icon={CircleDollarSign}
              tone="slate"
              hint={
                danosPropios.length > 0
                  ? moneda(danosPropios.reduce((total, dano) => total + dano.monto, 0))
                  : 'Sin reclamos registrados'
              }
            />
          </>
        ) : rol === 'personal' ? (
          <>
            <StatCard
              label="Baches registrados"
              value={baches.length}
              icon={MapPin}
              tone="indigo"
            />
            <StatCard
              label="Sin reparar"
              value={sinReparar}
              icon={Construction}
              tone="rose"
            />
            <StatCard
              label="En proceso"
              value={enProceso}
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Órdenes abiertas"
              value={ordenesAbiertas.length}
              icon={ClipboardList}
              tone="emerald"
            />
          </>
        ) : rol === 'equipo' ? (
          <>
            <StatCard
              label="Órdenes abiertas"
              value={ordenesAbiertas.length}
              icon={ClipboardList}
              tone="amber"
            />
            <StatCard
              label="Baches en proceso"
              value={enProceso}
              icon={Wrench}
              tone="indigo"
            />
            <StatCard
              label="Reparados"
              value={reparados}
              icon={CircleCheck}
              tone="emerald"
            />
            <StatCard
              label="Equipos"
              value={equipos.length}
              icon={Users}
              tone="slate"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Baches totales"
              value={baches.length}
              icon={MapPin}
              tone="indigo"
            />
            <StatCard
              label="Sin reparar"
              value={sinReparar}
              icon={Construction}
              tone="rose"
            />
            <StatCard
              label="En proceso"
              value={enProceso}
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Costo de reparaciones"
              value={moneda(costo)}
              icon={CircleDollarSign}
              tone="emerald"
              hint={`${reparados} reparados · ${temporales} temporales`}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {rol === 'ciudadano' ? 'Mis reportes recientes' : 'Reportes recientes'}
              </h2>
              <p className="text-xs text-slate-500">
                Últimos baches registrados en la demo
              </p>
            </div>
            <Link
              to="/baches"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Ver todos
            </Link>
          </div>

          {recientes.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              Todavía no hay reportes.{' '}
              {rol === 'ciudadano' ? (
                <Link to="/reportar" className="font-semibold text-indigo-600">
                  Reporta el primero
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((bache) => (
                <li key={bache.id}>
                  <Link
                    to={`/baches/${bache.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {bache.direccion}
                      </p>
                      <p className="text-xs text-slate-500">
                        {bache.id} · {bache.distrito} · {fecha(bache.fechaReporte)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                      <PrioridadBadge prioridad={bache.prioridad} />
                      <EstadoBadge estado={bache.estado} />
                    </div>
                    <ArrowRight size={16} className="hidden shrink-0 text-slate-400 sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-base font-bold text-slate-900">
            Cómo funciona tu rol
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{ROL_LABELS[rol]}</p>
          <ol className="mt-4 space-y-3">
            {PASOS[rol].map((paso, indice) => (
              <li key={paso} className="flex gap-3 text-sm text-slate-600">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                  {indice + 1}
                </span>
                <span>{paso}</span>
              </li>
            ))}
          </ol>

          {rol === 'equipo' && ordenesAbiertas.length > 0 ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Próxima orden
              </p>
              {(() => {
                const orden = ordenesAbiertas[0]
                const bache = baches.find((item) => item.id === orden.bacheId)
                return (
                  <Link
                    to="/ordenes"
                    className="mt-1 block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    {orden.id} · {bache?.direccion ?? orden.bacheId}
                    <span className="block text-xs font-normal text-slate-500">
                      {nombreEquipo(equipos, orden.equipoId)} · {orden.horas} h
                    </span>
                  </Link>
                )
              })()}
            </div>
          ) : null}

          {rol === 'supervisor' ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Distribución por prioridad
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {(['alta', 'media', 'baja'] as const).map((prioridad) => {
                  const cantidad = baches.filter(
                    (bache) => bache.prioridad === prioridad,
                  ).length
                  return (
                    <li key={prioridad} className="flex justify-between gap-2">
                      <span className="text-slate-600">
                        {PRIORIDAD_LABELS[prioridad]}
                      </span>
                      <span className="font-semibold text-slate-900">{cantidad}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {rol === 'personal' && temporales > 0 ? (
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-900">
              Hay {temporales}{' '}
              {temporales === 1 ? 'bache con reparación temporal' : 'baches con reparación temporal'}.
              Puedes abrir una nueva orden para cerrarlos definitivamente.
            </div>
          ) : null}
        </section>
      </div>

      {rol !== 'ciudadano' && rol !== 'supervisor' && ordenesAbiertas.length > 0 ? (
        <section className="card mt-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">Órdenes abiertas</h2>
            <Link
              to="/ordenes"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Gestionar
            </Link>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {ordenesAbiertas.slice(0, 6).map((orden) => {
              const bache = baches.find((item) => item.id === orden.bacheId)
              return (
                <div
                  key={orden.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500">{orden.id}</span>
                    <span className="text-xs text-slate-500">
                      {orden.horas} h · {orden.materialM3} m³
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {bache?.direccion ?? orden.bacheId}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {nombreEquipo(equipos, orden.equipoId)} · {orden.personas} personas
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

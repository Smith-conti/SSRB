import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock,
  FileText,
  HardHat,
  Lock,
  MapPin,
  Phone,
  Plus,
  User,
  Users,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AccesoDenegado } from '../components/AccesoDenegado'
import { AvanceForm } from '../components/AvanceForm'
import { Badge, EstadoBadge, EstadoOrdenBadge, PrioridadBadge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { OrdenForm } from '../components/OrdenForm'
import { PageHeader } from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { fecha, moneda, numero } from '../lib/format'
import {
  ESTADO_LABELS,
  POSICION_LABELS,
  PRIORIDAD_LABELS,
  RESULTADO_LABELS,
  TIPO_DANO_LABELS,
} from '../lib/labels'
import {
  puedeRegistrarDano,
  puedeVerBache,
  puedeVerDatosPersonales,
} from '../lib/permissions'
import { calcularCosto } from '../lib/rules'
import {
  costoBache,
  danosDeBache,
  nombreCiudadano,
  nombreEquipo,
  ordenesDeBache,
  telefonoCiudadano,
} from '../lib/selectors'
import type { ResultadoOrden } from '../types'

const RESULTADO_BADGE: Record<ResultadoOrden, string> = {
  reparado: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  reparacion_temporal: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  no_reparado: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
}

export function BacheDetalle() {
  const {
    rol,
    baches,
    ordenes,
    danos,
    ciudadanos,
    equipos,
    ajustes,
    ciudadanoActualId,
  } = useApp()
  const { id } = useParams<{ id: string }>()
  const [crearOrdenAbierto, setCrearOrdenAbierto] = useState(false)
  const [avanceId, setAvanceId] = useState<string | null>(null)

  const bache = baches.find((item) => item.id === id)

  if (!bache) {
    return (
      <EmptyState
        icon={MapPin}
        title="Bache no encontrado"
        description="El bache solicitado no existe o fue eliminado de la demo."
        action={
          <Link to="/baches" className="btn-primary">
            <ArrowLeft size={16} />
            Volver al listado
          </Link>
        }
      />
    )
  }

  if (!puedeVerBache(rol, bache, ciudadanoActualId)) {
    return <AccesoDenegado />
  }

  const historial = ordenesDeBache(ordenes, bache.id)
  const reclamos = danosDeBache(danos, bache.id).filter(
    (dano) => rol !== 'ciudadano' || dano.ciudadanoId === ciudadanoActualId,
  )
  const ordenAbierta = historial.find((orden) => orden.estado === 'abierta')
  const totalCosto = costoBache(bache.id, ordenes, ajustes)
  const totalReclamos = reclamos.reduce((total, dano) => total + dano.monto, 0)
  const permiteNuevaOrden =
    rol === 'personal' &&
    (bache.estado === 'no_reparado' || bache.estado === 'reparacion_temporal') &&
    !ordenAbierta
  const puedeAvanzar = (rol === 'personal' || rol === 'equipo') && Boolean(ordenAbierta)
  const verDatos = puedeVerDatosPersonales(rol)

  const reportante =
    bache.reportadoPor === 'personal'
      ? { nombre: 'Personal de obras públicas', telefono: undefined }
      : verDatos || (rol === 'ciudadano' && bache.ciudadanoId === ciudadanoActualId)
        ? {
            nombre:
              nombreCiudadano(ciudadanos, bache.ciudadanoId) ?? 'Ciudadano de Cusco',
            telefono: telefonoCiudadano(ciudadanos, bache.ciudadanoId),
          }
        : { nombre: 'Ciudadano de Cusco', telefono: undefined }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/baches"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          {rol === 'ciudadano' ? 'Volver a mis reportes' : 'Volver al listado'}
        </Link>
      </div>

      <PageHeader
        eyebrow={bache.id}
        title={bache.direccion}
        description={`${bache.distrito} · Registrado el ${fecha(bache.fechaReporte)}`}
        actions={
          <>
            <PrioridadBadge prioridad={bache.prioridad} />
            <EstadoBadge estado={bache.estado} />
            {permiteNuevaOrden ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCrearOrdenAbierto(true)}
              >
                <Plus size={16} />
                Crear orden
              </button>
            ) : null}
            {puedeAvanzar && ordenAbierta ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setAvanceId(ordenAbierta.id)}
              >
                <Wrench size={16} />
                Registrar avance
              </button>
            ) : null}
          </>
        }
      />

      {bache.notas ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <strong className="text-slate-900">Notas:</strong> {bache.notas}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900">Datos del bache</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Distrito</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                {bache.distrito}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Tamaño</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                {bache.tamano}/10
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Prioridad</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                {PRIORIDAD_LABELS[bache.prioridad]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Estado</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                {ESTADO_LABELS[bache.estado]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Posición en la vía</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <MapPin size={14} className="text-slate-400" />
                {POSICION_LABELS[bache.posicion]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Fecha de reporte</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <CalendarDays size={14} className="text-slate-400" />
                {fecha(bache.fechaReporte)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-slate-500">Reportado por</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                {reportante.nombre}
              </dd>
              {reportante.telefono ? (
                <dd className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone size={12} />
                  {reportante.telefono}
                </dd>
              ) : !verDatos && bache.reportadoPor === 'ciudadano' ? (
                <dd className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock size={12} />
                  Datos de contacto protegidos
                </dd>
              ) : null}
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Órdenes:</span>
              <strong className="text-slate-900">{historial.length}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Costo de reparaciones:</span>
              <strong className="text-slate-900">{moneda(totalCosto)}</strong>
            </div>
            {rol !== 'equipo' ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Reclamos:</span>
                <strong className="text-slate-900">{reclamos.length}</strong>
              </div>
            ) : null}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Wrench size={18} className="text-indigo-600" />
            Flujo del bache
          </h2>
          <ol className="mt-3 space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                1
              </span>
              <span className="text-slate-600">No reparado</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-amber-50 text-xs font-bold text-amber-700">
                2
              </span>
              <span className="text-slate-600">Trabajo en proceso con una orden</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                3
              </span>
              <span className="text-slate-600">Reparado o reparación temporal</span>
            </li>
          </ol>
          <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
            Un bache puede tener varias órdenes, pero solo una abierta a la vez.
            «Reparado» es un estado final.
          </p>
          {ordenAbierta ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <Clock size={13} />
              Orden abierta: {ordenAbierta.id}
            </p>
          ) : null}
        </section>
      </div>

      <section className="card mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Historial de órdenes de trabajo
            </h2>
            <p className="text-xs text-slate-500">
              {historial.length === 0
                ? 'Sin órdenes registradas'
                : `${historial.length} ${historial.length === 1 ? 'orden' : 'órdenes'} · Total ${moneda(totalCosto)}`}
            </p>
          </div>
          {permiteNuevaOrden ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCrearOrdenAbierto(true)}
            >
              <Plus size={16} />
              Nueva orden
            </button>
          ) : null}
        </div>

        {historial.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Todavía no se creó una orden para este bache.
          </p>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            {historial.map((orden) => {
              const costo = calcularCosto(orden, ajustes)
              return (
                <article
                  key={orden.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{orden.id}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Users size={12} />
                          {nombreEquipo(equipos, orden.equipoId)}
                        </span>
                        <span>·</span>
                        <span>Creada {fecha(orden.fechaCreacion)}</span>
                        {orden.fechaCierre ? (
                          <>
                            <span>·</span>
                            <span>Cerrada {fecha(orden.fechaCierre)}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EstadoOrdenBadge estado={orden.estado} />
                      {orden.resultado ? (
                        <Badge className={RESULTADO_BADGE[orden.resultado]}>
                          {RESULTADO_LABELS[orden.resultado]}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-slate-500">Personas</dt>
                      <dd className="font-semibold text-slate-900">{orden.personas}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Horas</dt>
                      <dd className="font-semibold text-slate-900">
                        {numero(orden.horas)} h
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Material</dt>
                      <dd className="font-semibold text-slate-900">
                        {numero(orden.materialM3)} m³
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Costo</dt>
                      <dd className="font-semibold text-slate-900">{moneda(costo)}</dd>
                    </div>
                  </dl>

                  {orden.equipamiento.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {orden.equipamiento.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {orden.observaciones ? (
                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {orden.observaciones}
                    </p>
                  ) : null}

                  {orden.estado === 'abierta' && puedeAvanzar ? (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setAvanceId(orden.id)}
                      >
                        <Wrench size={15} />
                        Registrar avance
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {rol !== 'equipo' ? (
        <section className="card mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <FileText size={18} className="text-indigo-600" />
                Reclamos de daños
              </h2>
              <p className="text-xs text-slate-500">
                {rol === 'ciudadano'
                  ? 'Solo se muestran los reclamos que registraste.'
                  : `${reclamos.length} ${reclamos.length === 1 ? 'reclamo' : 'reclamos'} · Total ${moneda(totalReclamos)}`}
              </p>
            </div>
            {puedeRegistrarDano(rol) ? (
              <Link to={`/danos?bache=${bache.id}`} className="btn-secondary">
                <Plus size={16} />
                Registrar reclamo
              </Link>
            ) : null}
          </div>

          {reclamos.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              No hay reclamos de daños asociados a este bache.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reclamos.map((dano) => (
                <li
                  key={dano.id}
                  className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <User size={14} className="text-slate-400" />
                      {dano.nombre}
                      <span className="text-xs font-normal text-slate-400">
                        {dano.id}
                      </span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} />
                        {dano.telefono}
                      </span>
                      <span>·</span>
                      <span>{dano.direccion}</span>
                      <span>·</span>
                      <span>{fecha(dano.fecha)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {TIPO_DANO_LABELS[dano.tipo]}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {moneda(dano.monto)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <CircleDollarSign size={14} />
          El costo de cada orden se calcula con las tarifas vigentes en Ajustes.
        </p>
        {rol === 'ciudadano' ? (
          <p className="mt-1 flex items-center gap-1.5">
            <HardHat size={14} />
            Este reporte es tuyo: ves su estado y tu información de contacto.
          </p>
        ) : null}
      </div>

      <OrdenForm
        open={crearOrdenAbierto}
        onClose={() => setCrearOrdenAbierto(false)}
        bacheFijo={bache.id}
      />
      <AvanceForm
        open={Boolean(avanceId)}
        onClose={() => setAvanceId(null)}
        ordenId={avanceId}
      />
    </div>
  )
}

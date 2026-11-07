import { ClipboardList, Plus, Search, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AvanceForm } from '../components/AvanceForm'
import { Badge, EstadoOrdenBadge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { OrdenForm } from '../components/OrdenForm'
import { PageHeader } from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { normalizar } from '../data/calles'
import { fecha, moneda, numero } from '../lib/format'
import { RESULTADO_LABELS } from '../lib/labels'
import { puedeEditarOrden } from '../lib/permissions'
import { calcularCosto } from '../lib/rules'
import { nombreEquipo } from '../lib/selectors'
import type { EstadoOrden, ResultadoOrden } from '../types'

const RESULTADO_BADGE: Record<ResultadoOrden, string> = {
  reparado: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  reparacion_temporal: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  no_reparado: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
}

export function Ordenes() {
  const { rol, ordenes, baches, equipos, ajustes } = useApp()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<EstadoOrden | ''>('')
  const [equipoId, setEquipoId] = useState('')
  const [crearAbierto, setCrearAbierto] = useState(false)
  const [avanceId, setAvanceId] = useState<string | null>(null)

  const busqueda = normalizar(texto)
  const filtradas = ordenes
    .filter((orden) => {
      const bache = baches.find((item) => item.id === orden.bacheId)
      if (
        busqueda &&
        !normalizar(orden.id).includes(busqueda) &&
        !normalizar(orden.bacheId).includes(busqueda) &&
        !normalizar(bache?.direccion ?? '').includes(busqueda)
      ) {
        return false
      }
      if (estado && orden.estado !== estado) return false
      if (equipoId && orden.equipoId !== equipoId) return false
      return true
    })
    .sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'abierta' ? -1 : 1
      return b.fechaCreacion.localeCompare(a.fechaCreacion)
    })

  const abiertas = ordenes.filter((orden) => orden.estado === 'abierta').length
  const cerradas = ordenes.length - abiertas
  const editable = puedeEditarOrden(rol)
  const hayFiltros = Boolean(texto || estado || equipoId)

  function limpiar() {
    setTexto('')
    setEstado('')
    setEquipoId('')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operación"
        title="Órdenes de trabajo"
        description={
          rol === 'supervisor'
            ? 'Consulta todas las órdenes y su estado. La edición corresponde al personal y al equipo de reparación.'
            : 'Asigna equipos, registra horas y material, y cierra las órdenes para actualizar el estado del bache.'
        }
        actions={
          rol === 'personal' ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCrearAbierto(true)}
            >
              <Plus size={16} />
              Nueva orden
            </button>
          ) : undefined
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Órdenes abiertas
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{abiertas}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Órdenes cerradas
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{cerradas}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Costo acumulado
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {moneda(
              ordenes.reduce(
                (total, orden) => total + calcularCosto(orden, ajustes),
                0,
              ),
            )}
          </p>
        </div>
      </div>

      <section className="card mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_220px_auto]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Buscar por orden, bache o dirección…"
              aria-label="Buscar órdenes"
            />
          </div>

          <select
            className="input"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value as EstadoOrden | '')}
            aria-label="Filtrar por estado de la orden"
          >
            <option value="">Todos los estados</option>
            <option value="abierta">Abiertas</option>
            <option value="cerrada">Cerradas</option>
          </select>

          <select
            className="input"
            value={equipoId}
            onChange={(evento) => setEquipoId(evento.target.value)}
            aria-label="Filtrar por equipo"
          >
            <option value="">Todos los equipos</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary"
            onClick={limpiar}
            disabled={!hayFiltros}
          >
            Limpiar
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Mostrando <strong className="text-slate-700">{filtradas.length}</strong> de{' '}
          {ordenes.length} órdenes.
        </p>
      </section>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={hayFiltros ? 'Sin resultados' : 'No hay órdenes de trabajo'}
          description={
            hayFiltros
              ? 'Prueba con otros filtros o limpia la búsqueda.'
              : rol === 'personal'
                ? 'Crea una orden para un bache en estado «No reparado» o «Reparación temporal».'
                : 'Todavía no se registraron órdenes.'
          }
          action={
            hayFiltros ? (
              <button type="button" className="btn-secondary" onClick={limpiar}>
                Limpiar filtros
              </button>
            ) : rol === 'personal' ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCrearAbierto(true)}
              >
                <Plus size={16} />
                Nueva orden
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="card hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="table-head">
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3">Bache</th>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3">Personal</th>
                    <th className="px-4 py-3">Horas / material</th>
                    <th className="px-4 py-3">Costo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((orden) => {
                    const bache = baches.find((item) => item.id === orden.bacheId)
                    return (
                      <tr key={orden.id} className="transition hover:bg-slate-50">
                        <td className="table-cell">
                          <p className="font-semibold text-slate-900">{orden.id}</p>
                          <p className="text-xs text-slate-400">
                            {fecha(orden.fechaCreacion)}
                          </p>
                        </td>
                        <td className="table-cell">
                          <Link
                            to={`/baches/${orden.bacheId}`}
                            className="font-medium text-indigo-700 hover:text-indigo-900"
                          >
                            {bache?.direccion ?? orden.bacheId}
                          </Link>
                          <p className="text-xs text-slate-400">{orden.bacheId}</p>
                        </td>
                        <td className="table-cell">
                          {nombreEquipo(equipos, orden.equipoId)}
                        </td>
                        <td className="table-cell text-slate-600">{orden.personas}</td>
                        <td className="table-cell whitespace-nowrap text-slate-600">
                          {numero(orden.horas)} h · {numero(orden.materialM3)} m³
                        </td>
                        <td className="table-cell font-semibold whitespace-nowrap text-slate-900">
                          {moneda(calcularCosto(orden, ajustes))}
                        </td>
                        <td className="table-cell">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <EstadoOrdenBadge estado={orden.estado} />
                            {orden.resultado ? (
                              <Badge className={RESULTADO_BADGE[orden.resultado]}>
                                {RESULTADO_LABELS[orden.resultado]}
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="table-cell text-right">
                          {orden.estado === 'abierta' && editable ? (
                            <button
                              type="button"
                              className="btn-secondary py-1.5"
                              onClick={() => setAvanceId(orden.id)}
                            >
                              <Wrench size={14} />
                              Avance
                            </button>
                          ) : (
                            <Link
                              to={`/baches/${orden.bacheId}`}
                              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              Ver bache
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {filtradas.map((orden) => {
              const bache = baches.find((item) => item.id === orden.bacheId)
              return (
                <article key={orden.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{orden.id}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-700">
                        {bache?.direccion ?? orden.bacheId}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {nombreEquipo(equipos, orden.equipoId)} · {orden.personas}{' '}
                        {orden.personas === 1 ? 'persona' : 'personas'}
                      </p>
                    </div>
                    <EstadoOrdenBadge estado={orden.estado} />
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs">
                    <div>
                      <dt className="text-slate-500">Horas</dt>
                      <dd className="font-semibold text-slate-900">
                        {numero(orden.horas)} h
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Material</dt>
                      <dd className="font-semibold text-slate-900">
                        {numero(orden.materialM3)} m³
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Costo</dt>
                      <dd className="font-semibold text-slate-900">
                        {moneda(calcularCosto(orden, ajustes))}
                      </dd>
                    </div>
                  </dl>

                  {orden.resultado ? (
                    <div className="mt-2">
                      <Badge className={RESULTADO_BADGE[orden.resultado]}>
                        {RESULTADO_LABELS[orden.resultado]}
                      </Badge>
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Link
                      to={`/baches/${orden.bacheId}`}
                      className="text-sm font-semibold text-indigo-600"
                    >
                      Ver bache
                    </Link>
                    {orden.estado === 'abierta' && editable ? (
                      <button
                        type="button"
                        className="btn-secondary py-1.5"
                        onClick={() => setAvanceId(orden.id)}
                      >
                        <Wrench size={14} />
                        Avance
                      </button>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      <OrdenForm open={crearAbierto} onClose={() => setCrearAbierto(false)} />
      <AvanceForm
        open={Boolean(avanceId)}
        onClose={() => setAvanceId(null)}
        ordenId={avanceId}
      />
    </div>
  )
}

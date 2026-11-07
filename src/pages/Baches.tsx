import { ListFilter, MapPin, MapPinned, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EstadoBadge, PrioridadBadge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { DISTRITOS, normalizar } from '../data/calles'
import { fecha } from '../lib/format'
import {
  ESTADOS_BACHE,
  ESTADO_DOT,
  ESTADO_LABELS,
  PRIORIDADES,
  PRIORIDAD_LABELS,
} from '../lib/labels'
import { bachesVisibles } from '../lib/permissions'
import type { EstadoBache, Prioridad } from '../types'

export function Baches() {
  const { rol, baches, ciudadanoActualId } = useApp()
  const [texto, setTexto] = useState('')
  const [distrito, setDistrito] = useState('')
  const [estado, setEstado] = useState<EstadoBache | ''>('')
  const [prioridad, setPrioridad] = useState<Prioridad | ''>('')

  const base = bachesVisibles(rol, baches, ciudadanoActualId)
  const busqueda = normalizar(texto)
  const filtrados = base
    .filter((bache) => {
      if (
        busqueda &&
        !normalizar(bache.id).includes(busqueda) &&
        !normalizar(bache.direccion).includes(busqueda) &&
        !normalizar(bache.calle).includes(busqueda)
      ) {
        return false
      }
      if (distrito && bache.distrito !== distrito) return false
      if (estado && bache.estado !== estado) return false
      if (prioridad && bache.prioridad !== prioridad) return false
      return true
    })
    .sort((a, b) => b.fechaReporte.localeCompare(a.fechaReporte))

  const hayFiltros = Boolean(texto || distrito || estado || prioridad)
  const titulo = rol === 'ciudadano' ? 'Mis reportes' : 'Baches'

  function limpiar() {
    setTexto('')
    setDistrito('')
    setEstado('')
    setPrioridad('')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo de baches"
        title={titulo}
        description={
          rol === 'ciudadano'
            ? 'Consulta únicamente los baches que reportaste. Tus datos personales quedan protegidos.'
            : 'Consulta todos los baches registrados y filtra por calle, distrito, estado o prioridad.'
        }
        actions={
          rol === 'ciudadano' || rol === 'personal' ? (
            <Link to="/reportar" className="btn-primary">
              <Plus size={16} />
              Reportar bache
            </Link>
          ) : undefined
        }
      />

      <section className="card mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_180px_190px_170px_auto]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Buscar por ID, calle o dirección…"
              aria-label="Buscar baches"
            />
          </div>

          <select
            className="input"
            value={distrito}
            onChange={(evento) => setDistrito(evento.target.value)}
            aria-label="Filtrar por distrito"
          >
            <option value="">Todos los distritos</option>
            {DISTRITOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value as EstadoBache | '')}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_BACHE.map((item) => (
              <option key={item} value={item}>
                {ESTADO_LABELS[item]}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={prioridad}
            onChange={(evento) => setPrioridad(evento.target.value as Prioridad | '')}
            aria-label="Filtrar por prioridad"
          >
            <option value="">Todas las prioridades</option>
            {PRIORIDADES.map((item) => (
              <option key={item} value={item}>
                {PRIORIDAD_LABELS[item]}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary"
            onClick={limpiar}
            disabled={!hayFiltros}
          >
            <ListFilter size={16} />
            Limpiar
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Mostrando <strong className="text-slate-700">{filtrados.length}</strong> de{' '}
          {base.length} baches
          {rol === 'ciudadano' ? ' propios' : ''}.
        </p>
      </section>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title={hayFiltros ? 'Sin resultados' : 'No hay baches registrados'}
          description={
            hayFiltros
              ? 'Prueba con otros filtros o limpia la búsqueda.'
              : rol === 'ciudadano'
                ? 'Todavía no reportaste ningún bache.'
                : 'Registra el primer bache para comenzar.'
          }
          action={
            hayFiltros ? (
              <button type="button" className="btn-secondary" onClick={limpiar}>
                Limpiar filtros
              </button>
            ) : rol === 'ciudadano' || rol === 'personal' ? (
              <Link to="/reportar" className="btn-primary">
                <Plus size={16} />
                Reportar bache
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="table-head">
                    <th className="px-4 py-3">Bache</th>
                    <th className="px-4 py-3">Dirección</th>
                    <th className="px-4 py-3">Distrito</th>
                    <th className="px-4 py-3">Tamaño</th>
                    <th className="px-4 py-3">Prioridad</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((bache) => (
                    <tr key={bache.id} className="transition hover:bg-slate-50">
                      <td className="table-cell">
                        <Link
                          to={`/baches/${bache.id}`}
                          className="font-semibold text-indigo-700 hover:text-indigo-900"
                        >
                          {bache.id}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <Link
                          to={`/baches/${bache.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-700"
                        >
                          {bache.direccion}
                        </Link>
                        {bache.notas ? (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                            {bache.notas}
                          </p>
                        ) : null}
                      </td>
                      <td className="table-cell">{bache.distrito}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {bache.tamano}
                          </span>
                          <span className="text-xs text-slate-400">/10</span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${bache.tamano * 10}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <PrioridadBadge prioridad={bache.prioridad} />
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`size-2 rounded-full ${ESTADO_DOT[bache.estado]}`}
                          />
                          <EstadoBadge estado={bache.estado} />
                        </span>
                      </td>
                      <td className="table-cell whitespace-nowrap text-slate-500">
                        {fecha(bache.fechaReporte)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtrados.map((bache) => (
              <Link
                key={bache.id}
                to={`/baches/${bache.id}`}
                className="card block p-4 transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500">{bache.id}</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {bache.direccion}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {bache.distrito} · {fecha(bache.fechaReporte)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {bache.tamano}/10
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <PrioridadBadge prioridad={bache.prioridad} />
                  <EstadoBadge estado={bache.estado} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

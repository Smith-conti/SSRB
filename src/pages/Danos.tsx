import { CircleCheck, FileText, Plus, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { normalizar } from '../data/calles'
import { fecha, moneda } from '../lib/format'
import { TIPOS_DANO, TIPO_DANO_LABELS } from '../lib/labels'
import { bachesVisibles, puedeRegistrarDano } from '../lib/permissions'
import { bacheEtiqueta } from '../lib/selectors'
import type { TipoDano } from '../types'

export function Danos() {
  const {
    rol,
    baches,
    danos,
    ciudadanoActual,
    ciudadanoActualId,
    addDano,
  } = useApp()
  const [searchParams] = useSearchParams()
  const bacheParam = searchParams.get('bache') ?? ''

  const puedeCrear = puedeRegistrarDano(rol)
  const bachesDisponibles = bachesVisibles(rol, baches, ciudadanoActualId)

  const [bacheId, setBacheId] = useState(bacheParam)
  const [nombre, setNombre] = useState(
    rol === 'ciudadano' ? (ciudadanoActual?.nombre ?? '') : '',
  )
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState(
    rol === 'ciudadano' ? (ciudadanoActual?.telefono ?? '') : '',
  )
  const [tipo, setTipo] = useState<TipoDano>('llanta')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const [texto, setTexto] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoDano | ''>('')

  useEffect(() => {
    if (bacheParam && bachesDisponibles.some((bache) => bache.id === bacheParam)) {
      setBacheId(bacheParam)
    }
    // Solo aplicamos el parámetro de la URL al entrar a la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bacheParam])

  useEffect(() => {
    const bache = bachesDisponibles.find((item) => item.id === bacheId)
    if (!bache) return
    setDireccion(bache.direccion)
    if (rol === 'ciudadano' && ciudadanoActual) {
      setNombre(ciudadanoActual.nombre)
      setTelefono(ciudadanoActual.telefono)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bacheId])

  const base =
    rol === 'ciudadano'
      ? danos.filter((dano) => dano.ciudadanoId === ciudadanoActualId)
      : danos
  const busqueda = normalizar(texto)
  const filtrados = base
    .filter((dano) => {
      const bache = baches.find((item) => item.id === dano.bacheId)
      if (
        busqueda &&
        !normalizar(dano.id).includes(busqueda) &&
        !normalizar(dano.nombre).includes(busqueda) &&
        !normalizar(dano.telefono).includes(busqueda) &&
        !normalizar(bache?.direccion ?? '').includes(busqueda)
      ) {
        return false
      }
      if (filtroTipo && dano.tipo !== filtroTipo) return false
      return true
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const total = base.reduce((suma, dano) => suma + dano.monto, 0)
  const bachesConReclamos = new Set(base.map((dano) => dano.bacheId)).size
  const hayFiltros = Boolean(texto || filtroTipo)

  function limpiarFiltros() {
    setTexto('')
    setFiltroTipo('')
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    setExito('')
    const resultado = addDano({
      bacheId,
      nombre,
      direccion,
      telefono,
      tipo,
      monto: Number(monto),
    })
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    setExito(`Reclamo ${resultado.data.id} registrado correctamente.`)
    setBacheId('')
    setMonto('')
    setTipo('llanta')
    if (rol === 'personal') {
      setNombre('')
      setDireccion('')
      setTelefono('')
    } else {
      setDireccion('')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Daños"
        title="Archivo de daños"
        description={
          rol === 'ciudadano'
            ? 'Registra los daños que sufriste por un bache y consulta únicamente tus propios reclamos.'
            : rol === 'supervisor'
              ? 'Consulta todos los reclamos de daños registrados. Solo lectura para el supervisor.'
              : 'Registra reclamos de daños con los datos del ciudadano y consulta el archivo completo.'
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            {rol === 'ciudadano' ? 'Mis reclamos' : 'Reclamos registrados'}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{base.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Monto reclamado
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{moneda(total)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Baches con reclamos
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{bachesConReclamos}</p>
        </div>
      </div>

      {puedeCrear ? (
        <section className="card mb-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar reclamo de daño
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                El reclamo queda asociado a un bache del catálogo.
              </p>
            </div>
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:inline-flex">
              {rol === 'ciudadano' ? 'Ciudadano' : 'Personal'}
            </span>
          </div>

          {rol === 'ciudadano' && bachesDisponibles.length === 0 ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Necesitas tener al menos un bache reportado para registrar un reclamo.{' '}
              <Link to="/reportar" className="font-semibold underline">
                Reportar un bache
              </Link>
            </div>
          ) : (
            <form onSubmit={enviar} className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="dano-bache">
                  Bache asociado <span className="text-rose-500">*</span>
                </label>
                <select
                  id="dano-bache"
                  className="input"
                  value={bacheId}
                  onChange={(evento) => setBacheId(evento.target.value)}
                  required
                >
                  <option value="">Selecciona un bache…</option>
                  {bachesDisponibles.map((bache) => (
                    <option key={bache.id} value={bache.id}>
                      {bacheEtiqueta(bache)} · {bache.distrito}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="dano-nombre">
                    Nombre del ciudadano <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="dano-nombre"
                    className="input"
                    value={nombre}
                    onChange={(evento) => setNombre(evento.target.value)}
                    placeholder="Nombre y apellido"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="dano-telefono">
                    Teléfono <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="dano-telefono"
                    className="input"
                    value={telefono}
                    onChange={(evento) => setTelefono(evento.target.value)}
                    placeholder="Ej.: 555-0101"
                    inputMode="tel"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="dano-direccion">
                    Dirección <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="dano-direccion"
                    className="input"
                    value={direccion}
                    onChange={(evento) => setDireccion(evento.target.value)}
                    placeholder="Dirección del ciudadano"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="dano-tipo">
                      Tipo de daño <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="dano-tipo"
                      className="input"
                      value={tipo}
                      onChange={(evento) => setTipo(evento.target.value as TipoDano)}
                    >
                      {TIPOS_DANO.map((item) => (
                        <option key={item} value={item}>
                          {TIPO_DANO_LABELS[item]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="dano-monto">
                      Monto <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="dano-monto"
                      type="number"
                      min={0.01}
                      step={0.01}
                      className="input"
                      value={monto}
                      onChange={(evento) => setMonto(evento.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <p className="flex items-start gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                Los datos personales solo son visibles para el personal de obras
                públicas y el supervisor. El ciudadano ve únicamente sus propios
                reclamos.
              </p>

              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
              {exito ? (
                <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CircleCheck size={15} />
                  {exito}
                </p>
              ) : null}

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  Registrar reclamo
                </button>
              </div>
            </form>
          )}
        </section>
      ) : (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <ShieldCheck size={15} className="mr-1.5 inline text-slate-400" />
          El supervisor puede consultar el archivo, pero los reclamos los registran el
          ciudadano y el personal de obras públicas.
        </div>
      )}

      <section className="card mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Buscar por reclamo, nombre, teléfono o dirección…"
              aria-label="Buscar reclamos"
            />
          </div>
          <select
            className="input"
            value={filtroTipo}
            onChange={(evento) => setFiltroTipo(evento.target.value as TipoDano | '')}
            aria-label="Filtrar por tipo de daño"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_DANO.map((item) => (
              <option key={item} value={item}>
                {TIPO_DANO_LABELS[item]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Mostrando <strong className="text-slate-700">{filtrados.length}</strong> de{' '}
          {base.length} reclamos.
        </p>
      </section>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={hayFiltros ? 'Sin resultados' : 'No hay reclamos registrados'}
          description={
            hayFiltros
              ? 'Prueba con otros filtros o limpia la búsqueda.'
              : rol === 'ciudadano'
                ? 'Todavía no registraste reclamos de daños.'
                : 'Los reclamos de daños aparecerán aquí.'
          }
          action={
            hayFiltros ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
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
                    <th className="px-4 py-3">Reclamo</th>
                    <th className="px-4 py-3">Ciudadano</th>
                    <th className="px-4 py-3">Bache</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((dano) => {
                    const bache = baches.find((item) => item.id === dano.bacheId)
                    return (
                      <tr key={dano.id} className="transition hover:bg-slate-50">
                        <td className="table-cell">
                          <p className="font-semibold text-slate-900">{dano.id}</p>
                          <p className="text-xs text-slate-400">{fecha(dano.fecha)}</p>
                        </td>
                        <td className="table-cell">
                          <p className="font-medium text-slate-900">{dano.nombre}</p>
                          <p className="text-xs text-slate-400">
                            {dano.telefono} · {dano.direccion}
                          </p>
                        </td>
                        <td className="table-cell">
                          <Link
                            to={`/baches/${dano.bacheId}`}
                            className="font-medium text-indigo-700 hover:text-indigo-900"
                          >
                            {bache?.direccion ?? dano.bacheId}
                          </Link>
                          <p className="text-xs text-slate-400">{dano.bacheId}</p>
                        </td>
                        <td className="table-cell">
                          <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                            {TIPO_DANO_LABELS[dano.tipo]}
                          </Badge>
                        </td>
                        <td className="table-cell font-semibold whitespace-nowrap text-slate-900">
                          {moneda(dano.monto)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {filtrados.map((dano) => {
              const bache = baches.find((item) => item.id === dano.bacheId)
              return (
                <article key={dano.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500">{dano.id}</p>
                      <p className="mt-0.5 font-semibold text-slate-900">
                        {dano.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dano.telefono} · {dano.direccion}
                      </p>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {moneda(dano.monto)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                      {TIPO_DANO_LABELS[dano.tipo]}
                    </Badge>
                    <span className="text-xs text-slate-400">{fecha(dano.fecha)}</span>
                  </div>
                  <Link
                    to={`/baches/${dano.bacheId}`}
                    className="mt-2 block text-sm font-semibold text-indigo-600"
                  >
                    {bache?.direccion ?? dano.bacheId}
                  </Link>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

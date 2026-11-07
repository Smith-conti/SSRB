import {
  CircleDollarSign,
  Clock,
  Construction,
  MapPin,
  Settings,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { useApp } from '../context/AppContext'
import { DISTRITOS } from '../data/calles'
import { moneda } from '../lib/format'
import {
  ESTADOS_BACHE,
  ESTADO_COLOR,
  ESTADO_LABELS,
  PRIORIDAD_COLOR,
  PRIORIDAD_LABELS,
} from '../lib/labels'
import { calcularCosto } from '../lib/rules'
import { costoTotal, totalDanos } from '../lib/selectors'

export function Panel() {
  const { baches, ordenes, danos, ajustes } = useApp()

  const sinReparar = baches.filter((bache) => bache.estado === 'no_reparado').length
  const enProceso = baches.filter((bache) => bache.estado === 'en_proceso').length
  const reparados = baches.filter((bache) => bache.estado === 'reparado').length
  const temporales = baches.filter(
    (bache) => bache.estado === 'reparacion_temporal',
  ).length
  const costo = costoTotal(ordenes, ajustes)
  const montoDanos = totalDanos(danos)

  const datosEstado = ESTADOS_BACHE.map((estado) => ({
    clave: estado,
    name: ESTADO_LABELS[estado],
    value: baches.filter((bache) => bache.estado === estado).length,
    color: ESTADO_COLOR[estado],
  }))

  const datosDistrito = DISTRITOS.map((distrito) => {
    const delDistrito = baches.filter((bache) => bache.distrito === distrito)
    const ids = new Set(delDistrito.map((bache) => bache.id))
    const ordenesDistrito = ordenes.filter((orden) => ids.has(orden.bacheId))
    return {
      distrito,
      total: delDistrito.length,
      noReparado: delDistrito.filter((bache) => bache.estado === 'no_reparado').length,
      enProceso: delDistrito.filter((bache) => bache.estado === 'en_proceso').length,
      reparado: delDistrito.filter((bache) => bache.estado === 'reparado').length,
      temporal: delDistrito.filter(
        (bache) => bache.estado === 'reparacion_temporal',
      ).length,
      costo: ordenesDistrito.reduce(
        (suma, orden) => suma + calcularCosto(orden, ajustes),
        0,
      ),
    }
  })

  const porcentaje = (cantidad: number) =>
    baches.length === 0 ? 0 : Math.round((cantidad / baches.length) * 100)

  return (
    <div>
      <PageHeader
        eyebrow="Supervisor"
        title="Panel de control"
        description="Indicadores de la operación de baches de Villa Nueva: estado, prioridad, distritos y costos."
        actions={
          <Link to="/ajustes" className="btn-secondary">
            <Settings size={16} />
            Ajustes y tarifas
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          hint={`${porcentaje(sinReparar)}% del total`}
        />
        <StatCard
          label="En proceso"
          value={enProceso}
          icon={Clock}
          tone="amber"
          hint={`${porcentaje(enProceso)}% del total`}
        />
        <StatCard
          label="Costo de reparaciones"
          value={moneda(costo)}
          icon={CircleDollarSign}
          tone="emerald"
          hint={`${ordenes.length} órdenes registradas`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-base font-bold text-slate-900">Baches por estado</h2>
          <p className="text-xs text-slate-500">
            Distribución actual de los {baches.length} baches registrados.
          </p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosEstado}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {datosEstado.map((item) => (
                    <Cell key={item.clave} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  formatter={(valor) => (
                    <span className="text-xs text-slate-600">{valor}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {datosEstado.map((item) => (
              <div key={item.clave} className="rounded-lg bg-slate-50 p-2">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <p className="mt-1 text-slate-500">{item.name}</p>
                <p className="text-base font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-base font-bold text-slate-900">Baches por distrito</h2>
          <p className="text-xs text-slate-500">
            Cantidad y estado de los baches en cada distrito.
          </p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosDistrito} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="distrito" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  formatter={(valor) => (
                    <span className="text-xs text-slate-600">{valor}</span>
                  )}
                />
                <Bar dataKey="noReparado" name="No reparado" stackId="a" fill="#f43f5e" />
                <Bar dataKey="enProceso" name="En proceso" stackId="a" fill="#f59e0b" />
                <Bar dataKey="reparado" name="Reparado" stackId="a" fill="#10b981" />
                <Bar
                  dataKey="temporal"
                  name="Temporal"
                  stackId="a"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(['alta', 'media', 'baja'] as const).map((prioridad) => {
          const cantidad = baches.filter(
            (bache) => bache.prioridad === prioridad,
          ).length
          return (
            <div key={prioridad} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Prioridad {PRIORIDAD_LABELS[prioridad].toLowerCase()}
                </p>
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: PRIORIDAD_COLOR[prioridad] }}
                />
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">{cantidad}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${porcentaje(cantidad)}%`,
                    backgroundColor: PRIORIDAD_COLOR[prioridad],
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {porcentaje(cantidad)}% de los baches
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="card overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">Resumen por distrito</h2>
            <p className="text-xs text-slate-500">
              Estado de los baches y costo de las órdenes asociadas.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3">Distrito</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">No reparados</th>
                  <th className="px-4 py-3">En proceso</th>
                  <th className="px-4 py-3">Reparados</th>
                  <th className="px-4 py-3">Costo</th>
                </tr>
              </thead>
              <tbody>
                {datosDistrito.map((fila) => (
                  <tr key={fila.distrito} className="transition hover:bg-slate-50">
                    <td className="table-cell font-semibold text-slate-900">
                      {fila.distrito}
                    </td>
                    <td className="table-cell">{fila.total}</td>
                    <td className="table-cell text-rose-600">{fila.noReparado}</td>
                    <td className="table-cell text-amber-600">{fila.enProceso}</td>
                    <td className="table-cell text-emerald-600">{fila.reparado}</td>
                    <td className="table-cell font-semibold whitespace-nowrap text-slate-900">
                      {moneda(fila.costo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-900">
                    Total
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-900">
                    {baches.length}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-sm text-rose-600">
                    {sinReparar}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-sm text-amber-600">
                    {enProceso}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-sm text-emerald-600">
                    {reparados}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-sm whitespace-nowrap text-slate-900">
                    {moneda(costo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Estado del flujo</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Reparados</dt>
                <dd className="font-semibold text-emerald-700">{reparados}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Reparación temporal</dt>
                <dd className="font-semibold text-indigo-700">{temporales}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Órdenes abiertas</dt>
                <dd className="font-semibold text-amber-700">
                  {ordenes.filter((orden) => orden.estado === 'abierta').length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Órdenes cerradas</dt>
                <dd className="font-semibold text-slate-700">
                  {ordenes.filter((orden) => orden.estado === 'cerrada').length}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Daños reclamados</h2>
            <p className="mt-1 text-2xl font-bold text-slate-900">{moneda(montoDanos)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {danos.length} {danos.length === 1 ? 'reclamo registrado' : 'reclamos registrados'} en el
              archivo de daños.
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <TriangleAlert size={14} />
              Datos de demostración
            </p>
            <p className="mt-1 leading-relaxed">
              Todo se guarda en localStorage. Puedes exportar el JSON o restablecer
              los datos desde Ajustes.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

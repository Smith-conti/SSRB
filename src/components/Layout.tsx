import {
  ChartColumn,
  ClipboardList,
  Construction,
  FileText,
  Home,
  Info,
  MapPin,
  Menu,
  Plus,
  Settings,
  TriangleAlert,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROL_LABELS, ROLES } from '../lib/labels'
import type { Rol } from '../types'

interface ItemNav {
  to: string
  label: string
  icon: typeof Home
  roles: Rol[]
}

const TODOS: Rol[] = ['ciudadano', 'personal', 'equipo', 'supervisor']

const ITEMS: ItemNav[] = [
  { to: '/', label: 'Inicio', icon: Home, roles: TODOS },
  {
    to: '/reportar',
    label: 'Reportar bache',
    icon: Plus,
    roles: ['ciudadano', 'personal'],
  },
  { to: '/baches', label: 'Baches', icon: MapPin, roles: TODOS },
  {
    to: '/ordenes',
    label: 'Órdenes de trabajo',
    icon: ClipboardList,
    roles: ['personal', 'equipo', 'supervisor'],
  },
  {
    to: '/danos',
    label: 'Archivo de daños',
    icon: FileText,
    roles: ['ciudadano', 'personal', 'supervisor'],
  },
  {
    to: '/panel',
    label: 'Panel del supervisor',
    icon: ChartColumn,
    roles: ['supervisor'],
  },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, roles: ['supervisor'] },
]

function enlaceClase(activo: boolean): string {
  return activo
    ? 'flex items-center gap-3 rounded-lg bg-indigo-500/15 px-3 py-2.5 text-sm font-semibold text-white ring-1 ring-indigo-400/30'
    : 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white'
}

export function Layout() {
  const { rol, setRol, ciudadanoActual, storageOk } = useApp()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const itemsVisibles = ITEMS.filter((item) => item.roles.includes(rol))
  const descripcionRol = ROLES.find((item) => item.value === rol)?.descripcion

  function cambiarRol(nuevo: Rol) {
    setRol(nuevo)
    setMenuAbierto(false)
  }

  const navegacion = (
    <nav className="flex flex-col gap-1">
      {itemsVisibles.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => enlaceClase(isActive)}
          onClick={() => setMenuAbierto(false)}
        >
          <item.icon size={18} className="shrink-0" />
          {item.to === '/baches' && rol === 'ciudadano' ? 'Mis reportes' : item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-slate-900 lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Construction size={22} />
          </div>
          <div>
            <p className="text-base leading-tight font-bold text-white">SSRB</p>
            <p className="text-[11px] text-slate-400">Cusco · Obras públicas</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">{navegacion}</div>

        <div className="border-t border-white/10 p-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Rol activo
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{ROL_LABELS[rol]}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{descripcionRol}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="btn-ghost -ml-1 p-2 lg:hidden"
              onClick={() => setMenuAbierto((valor) => !valor)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
                <Construction size={17} />
              </div>
              <span className="text-sm font-bold text-slate-900">SSRB</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {rol === 'ciudadano' && ciudadanoActual ? (
                <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 md:flex">
                  <User size={14} />
                  {ciudadanoActual.nombre}
                </span>
              ) : null}
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="hidden sm:inline">Rol</span>
                <select
                  value={rol}
                  onChange={(evento) => cambiarRol(evento.target.value as Rol)}
                  className="input w-auto py-1.5 pr-8 pl-2.5 text-xs font-semibold text-slate-800"
                  aria-label="Cambiar rol"
                >
                  {ROLES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {menuAbierto ? (
            <div className="border-t border-white/10 bg-slate-900 px-3 py-3 lg:hidden">
              {navegacion}
              <div className="mt-3 border-t border-white/10 px-3 pt-3">
                <p className="text-xs font-semibold text-white">{ROL_LABELS[rol]}</p>
                <p className="mt-1 text-xs text-slate-400">{descripcionRol}</p>
              </div>
            </div>
          ) : null}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>
              <strong>Demo:</strong> los datos se guardan solo en este navegador.
            </p>
          </div>

          {!storageOk ? (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" />
              <p>
                <strong>localStorage no disponible:</strong> los cambios no se
                conservarán al recargar la página.
              </p>
            </div>
          ) : null}

          <Outlet />

          <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-500">
            SSRB · Demo del Sistema de Seguimiento y Reparación de Baches · Cusco
          </footer>
        </main>
      </div>
    </div>
  )
}

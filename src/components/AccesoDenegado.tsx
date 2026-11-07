import { ArrowLeft, Lock, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROL_LABELS } from '../lib/labels'

export function AccesoDenegado() {
  const { rol } = useApp()
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <Lock size={28} />
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900">Acceso denegado</h1>
      <p className="mt-2 text-sm text-slate-600">
        No tienes permiso para acceder a esta sección con el rol{' '}
        <strong>{ROL_LABELS[rol]}</strong>. Cambia de rol en la barra superior o vuelve
        al inicio.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>
    </div>
  )
}

export function NoEncontrado() {
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
        <TriangleAlert size={28} />
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-600">
        La ruta que buscas no existe en esta demo.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>
    </div>
  )
}

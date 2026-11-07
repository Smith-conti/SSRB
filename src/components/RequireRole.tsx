import type { ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import type { Rol } from '../types'
import { AccesoDenegado } from './AccesoDenegado'

export function RequireRole({
  roles,
  children,
}: {
  roles: Rol[]
  children: ReactNode
}) {
  const { rol } = useApp()
  if (!roles.includes(rol)) return <AccesoDenegado />
  return <>{children}</>
}

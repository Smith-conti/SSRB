import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { DISTRITOS, buscarCalle } from '../data/calles'
import { crearDatosDemo } from '../data/seed'
import { siguienteId } from '../lib/ids'
import { ESTADO_LABELS } from '../lib/labels'
import {
  puedeCrearOrden,
  puedeEditarOrden,
  puedeRegistrarDano,
  puedeReportarBache,
} from '../lib/permissions'
import { calcularPrioridad, puedeTransicionar } from '../lib/rules'
import {
  CLAVES,
  borrarDatosDemo,
  descargarArchivo,
  escribirJSON,
  leerJSON,
  nombreArchivoExportado,
} from '../lib/storage'
import {
  horasValidas,
  materialValido,
  montoValido,
  personasValidas,
  tarifaValida,
  telefonoValido,
  textoRequerido,
} from '../lib/validation'
import type {
  Ajustes,
  Bache,
  Ciudadano,
  Dano,
  Equipo,
  EstadoBache,
  Orden,
  PosicionVia,
  ResultadoOrden,
  Rol,
  TipoDano,
} from '../types'

export interface NuevoBache {
  calle: string
  altura: string
  tamano: number
  posicion: PosicionVia
  notas?: string
}

export interface NuevaOrden {
  bacheId: string
  equipoId: string
  personas: number
  equipamiento: string[]
  observaciones?: string
}

export interface NuevoDano {
  bacheId: string
  nombre: string
  direccion: string
  telefono: string
  tipo: TipoDano
  monto: number
}

export interface PatchOrden {
  equipoId?: string
  personas?: number
  equipamiento?: string[]
  horas?: number
  materialM3?: number
  observaciones?: string
}

export type Resultado<T> = { ok: true; data: T } | { ok: false; error: string }

interface AppContextValue {
  rol: Rol
  setRol: (rol: Rol) => void
  baches: Bache[]
  ordenes: Orden[]
  danos: Dano[]
  ciudadanos: Ciudadano[]
  equipos: Equipo[]
  ajustes: Ajustes
  ciudadanoActual: Ciudadano | undefined
  ciudadanoActualId: string | undefined
  storageOk: boolean
  addBache: (input: NuevoBache) => Resultado<Bache>
  addDano: (input: NuevoDano) => Resultado<Dano>
  crearOrden: (input: NuevaOrden) => Resultado<Orden>
  actualizarOrden: (id: string, patch: PatchOrden) => Resultado<Orden>
  cerrarOrden: (
    id: string,
    resultado: ResultadoOrden,
    patch?: PatchOrden,
  ) => Resultado<Orden>
  guardarAjustes: (ajustes: Ajustes) => Resultado<Ajustes>
  restablecerDemo: () => void
  exportarDatos: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const ROLES_VALIDOS: Rol[] = ['ciudadano', 'personal', 'equipo', 'supervisor']
const DISTRITOS_VALIDOS = new Set<string>(DISTRITOS)

function esArreglo(valor: unknown): valor is unknown[] {
  return Array.isArray(valor)
}

function esAjustesValido(valor: unknown): valor is Ajustes {
  if (!valor || typeof valor !== 'object') return false
  const posibles = valor as Record<string, unknown>
  return ['tarifaHora', 'costoMaterialM3', 'costoEquipamiento'].every(
    (clave) => typeof posibles[clave] === 'number' && Number.isFinite(posibles[clave]),
  )
}

function cargarEstadoInicial() {
  const semilla = crearDatosDemo()

  const bachesGuardados = leerJSON<unknown>(CLAVES.baches, null)
  // Si los datos guardados son de una versión anterior con otra ciudad,
  // recargamos la semilla completa para evitar distritos fuera del catálogo.
  const datosDeOtraCiudad =
    esArreglo(bachesGuardados) &&
    (bachesGuardados as Bache[]).some(
      (bache) => !DISTRITOS_VALIDOS.has(bache.distrito),
    )

  const baches =
    !datosDeOtraCiudad && esArreglo(bachesGuardados)
      ? (bachesGuardados as Bache[])
      : semilla.baches

  const ordenes = (() => {
    const guardado = leerJSON<unknown>(CLAVES.ordenes, null)
    return !datosDeOtraCiudad && esArreglo(guardado)
      ? (guardado as Orden[])
      : semilla.ordenes
  })()

  const danos = (() => {
    const guardado = leerJSON<unknown>(CLAVES.danos, null)
    return !datosDeOtraCiudad && esArreglo(guardado)
      ? (guardado as Dano[])
      : semilla.danos
  })()

  const ciudadanos = (() => {
    const guardado = leerJSON<unknown>(CLAVES.ciudadanos, null)
    return !datosDeOtraCiudad && esArreglo(guardado)
      ? (guardado as Ciudadano[])
      : semilla.ciudadanos
  })()

  const equipos = (() => {
    const guardado = leerJSON<unknown>(CLAVES.equipos, null)
    return !datosDeOtraCiudad && esArreglo(guardado)
      ? (guardado as Equipo[])
      : semilla.equipos
  })()

  const ajustes = (() => {
    const guardado = leerJSON<unknown>(CLAVES.ajustes, null)
    if (!datosDeOtraCiudad && esAjustesValido(guardado)) return guardado
    return semilla.ajustes
  })()

  const rolGuardado = leerJSON<unknown>(CLAVES.rol, 'ciudadano')
  const rol = ROLES_VALIDOS.includes(rolGuardado as Rol)
    ? (rolGuardado as Rol)
    : 'ciudadano'

  const ciudadanoGuardado = leerJSON<unknown>(CLAVES.ciudadanoActual, null)
  const ciudadanoActualId =
    typeof ciudadanoGuardado === 'string' && ciudadanoGuardado
      ? ciudadanoGuardado
      : (ciudadanos[0]?.id ?? semilla.ciudadanos[0].id)

  // Persistimos la semilla si era la primera vez.
  escribirJSON(CLAVES.baches, baches)
  escribirJSON(CLAVES.ordenes, ordenes)
  escribirJSON(CLAVES.danos, danos)
  escribirJSON(CLAVES.ciudadanos, ciudadanos)
  escribirJSON(CLAVES.equipos, equipos)
  escribirJSON(CLAVES.ajustes, ajustes)

  return {
    baches,
    ordenes,
    danos,
    ciudadanos,
    equipos,
    ajustes,
    rol,
    ciudadanoActualId,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [inicial] = useState(cargarEstadoInicial)
  const [rol, setRol] = useState<Rol>(inicial.rol)
  const [baches, setBaches] = useState<Bache[]>(inicial.baches)
  const [ordenes, setOrdenes] = useState<Orden[]>(inicial.ordenes)
  const [danos, setDanos] = useState<Dano[]>(inicial.danos)
  const [ciudadanos] = useState<Ciudadano[]>(inicial.ciudadanos)
  const [equipos] = useState<Equipo[]>(inicial.equipos)
  const [ajustes, setAjustes] = useState<Ajustes>(inicial.ajustes)
  const [ciudadanoActualId] = useState<string | undefined>(inicial.ciudadanoActualId)
  const [storageOk, setStorageOk] = useState(true)

  const ciudadanoActual =
    ciudadanos.find((ciudadano) => ciudadano.id === ciudadanoActualId) ?? ciudadanos[0]

  useEffect(() => {
    let ok = true
    ok = escribirJSON(CLAVES.baches, baches) && ok
    ok = escribirJSON(CLAVES.ordenes, ordenes) && ok
    ok = escribirJSON(CLAVES.danos, danos) && ok
    ok = escribirJSON(CLAVES.ciudadanos, ciudadanos) && ok
    ok = escribirJSON(CLAVES.equipos, equipos) && ok
    ok = escribirJSON(CLAVES.ajustes, ajustes) && ok
    ok = escribirJSON(CLAVES.rol, rol) && ok
    if (ciudadanoActual?.id) {
      ok = escribirJSON(CLAVES.ciudadanoActual, ciudadanoActual.id) && ok
    }
    setStorageOk(ok)
  }, [baches, ordenes, danos, ciudadanos, equipos, ajustes, rol, ciudadanoActual?.id])

  const addBache = (input: NuevoBache): Resultado<Bache> => {
    if (!puedeReportarBache(rol)) {
      return { ok: false, error: 'Tu rol no puede registrar baches.' }
    }
    const calle = buscarCalle(input.calle)
    if (!calle) {
      return { ok: false, error: 'Selecciona una calle del catálogo de Cusco.' }
    }
    if (!textoRequerido(input.altura)) {
      return { ok: false, error: 'Indica la altura o el número de la dirección.' }
    }
    if (!Number.isInteger(input.tamano) || input.tamano < 1 || input.tamano > 10) {
      return { ok: false, error: 'El tamaño debe ser un entero entre 1 y 10.' }
    }
    if (rol === 'ciudadano' && !ciudadanoActual) {
      return {
        ok: false,
        error: 'No se encontró tu perfil de ciudadano. Restablece la demo.',
      }
    }

    const altura = input.altura.trim()
    const bache: Bache = {
      id: siguienteId(
        'BCH',
        baches.map((item) => item.id),
      ),
      calle: calle.nombre,
      altura,
      direccion: `${calle.nombre} ${altura}`,
      distrito: calle.distrito,
      tamano: input.tamano,
      posicion: input.posicion,
      prioridad: calcularPrioridad(input.tamano),
      estado: 'no_reparado',
      reportadoPor: rol === 'ciudadano' ? 'ciudadano' : 'personal',
      ciudadanoId: rol === 'ciudadano' ? ciudadanoActual?.id : undefined,
      notas: input.notas?.trim() ? input.notas.trim() : undefined,
      fechaReporte: new Date().toISOString(),
    }
    setBaches((previos) => [bache, ...previos])
    return { ok: true, data: bache }
  }

  const addDano = (input: NuevoDano): Resultado<Dano> => {
    if (!puedeRegistrarDano(rol)) {
      return { ok: false, error: 'Tu rol no puede registrar reclamos de daños.' }
    }
    const bache = baches.find((item) => item.id === input.bacheId)
    if (!bache) {
      return { ok: false, error: 'Selecciona un bache válido.' }
    }
    if (rol === 'ciudadano' && bache.ciudadanoId !== ciudadanoActual?.id) {
      return {
        ok: false,
        error: 'Solo puedes registrar reclamos sobre baches de tus propios reportes.',
      }
    }
    if (!textoRequerido(input.nombre, 2)) {
      return { ok: false, error: 'Indica el nombre del ciudadano.' }
    }
    if (!textoRequerido(input.direccion, 3)) {
      return { ok: false, error: 'Indica la dirección del ciudadano.' }
    }
    if (!telefonoValido(input.telefono)) {
      return {
        ok: false,
        error: 'El teléfono no es válido. Usa entre 7 y 15 dígitos.',
      }
    }
    if (!montoValido(input.monto)) {
      return { ok: false, error: 'El monto debe ser mayor que cero.' }
    }

    const dano: Dano = {
      id: siguienteId(
        'DAN',
        danos.map((item) => item.id),
      ),
      bacheId: input.bacheId,
      ciudadanoId: rol === 'ciudadano' ? ciudadanoActual?.id : undefined,
      nombre: input.nombre.trim(),
      direccion: input.direccion.trim(),
      telefono: input.telefono.trim(),
      tipo: input.tipo,
      monto: Math.round(input.monto * 100) / 100,
      fecha: new Date().toISOString(),
    }
    setDanos((previos) => [dano, ...previos])
    return { ok: true, data: dano }
  }

  const crearOrden = (input: NuevaOrden): Resultado<Orden> => {
    if (!puedeCrearOrden(rol)) {
      return { ok: false, error: 'Solo el personal de obras públicas crea órdenes.' }
    }
    const bache = baches.find((item) => item.id === input.bacheId)
    if (!bache) {
      return { ok: false, error: 'Selecciona un bache válido.' }
    }
    if (bache.estado !== 'no_reparado' && bache.estado !== 'reparacion_temporal') {
      return {
        ok: false,
        error: `El bache está en estado "${ESTADO_LABELS[bache.estado]}" y no admite una nueva orden.`,
      }
    }
    if (!puedeTransicionar(bache.estado, 'en_proceso')) {
      return { ok: false, error: 'La transición de estado no está permitida.' }
    }
    const ordenAbierta = ordenes.some(
      (orden) => orden.bacheId === bache.id && orden.estado === 'abierta',
    )
    if (ordenAbierta) {
      return { ok: false, error: 'El bache ya tiene una orden de trabajo abierta.' }
    }
    const equipo = equipos.find((item) => item.id === input.equipoId)
    if (!equipo) {
      return { ok: false, error: 'Selecciona un equipo de reparación válido.' }
    }
    if (!personasValidas(input.personas)) {
      return { ok: false, error: 'La cantidad de personas debe estar entre 1 y 50.' }
    }

    const orden: Orden = {
      id: siguienteId(
        'ORD',
        ordenes.map((item) => item.id),
      ),
      bacheId: bache.id,
      equipoId: equipo.id,
      personas: input.personas,
      equipamiento: [...input.equipamiento],
      horas: 0,
      materialM3: 0,
      estado: 'abierta',
      observaciones: input.observaciones?.trim() || undefined,
      fechaCreacion: new Date().toISOString(),
    }

    setOrdenes((previas) => [orden, ...previas])
    setBaches((previos) =>
      previos.map((item) =>
        item.id === bache.id ? { ...item, estado: 'en_proceso' } : item,
      ),
    )
    return { ok: true, data: orden }
  }

  const actualizarOrden = (id: string, patch: PatchOrden): Resultado<Orden> => {
    if (!puedeEditarOrden(rol)) {
      return { ok: false, error: 'Tu rol no puede modificar órdenes de trabajo.' }
    }
    const orden = ordenes.find((item) => item.id === id)
    if (!orden) return { ok: false, error: 'La orden no existe.' }
    if (orden.estado !== 'abierta') {
      return { ok: false, error: 'La orden ya está cerrada.' }
    }
    if (patch.personas !== undefined && !personasValidas(patch.personas)) {
      return { ok: false, error: 'La cantidad de personas debe estar entre 1 y 50.' }
    }
    if (patch.horas !== undefined && !horasValidas(patch.horas)) {
      return { ok: false, error: 'Las horas deben ser un número entre 0 y 1000.' }
    }
    if (patch.materialM3 !== undefined && !materialValido(patch.materialM3)) {
      return { ok: false, error: 'El material debe ser un número entre 0 y 10000.' }
    }
    if (patch.equipoId !== undefined && !equipos.some((e) => e.id === patch.equipoId)) {
      return { ok: false, error: 'El equipo seleccionado no existe.' }
    }

    const actualizada: Orden = {
      ...orden,
      ...patch,
      equipamiento: patch.equipamiento ? [...patch.equipamiento] : orden.equipamiento,
      observaciones:
        patch.observaciones !== undefined
          ? patch.observaciones.trim() || undefined
          : orden.observaciones,
    }
    setOrdenes((previas) =>
      previas.map((item) => (item.id === id ? actualizada : item)),
    )
    return { ok: true, data: actualizada }
  }

  const cerrarOrden = (
    id: string,
    resultado: ResultadoOrden,
    patch?: PatchOrden,
  ): Resultado<Orden> => {
    if (!puedeEditarOrden(rol)) {
      return { ok: false, error: 'Tu rol no puede cerrar órdenes de trabajo.' }
    }
    const orden = ordenes.find((item) => item.id === id)
    if (!orden) return { ok: false, error: 'La orden no existe.' }
    if (orden.estado !== 'abierta') {
      return { ok: false, error: 'La orden ya está cerrada.' }
    }
    const bache = baches.find((item) => item.id === orden.bacheId)
    if (!bache) return { ok: false, error: 'El bache asociado no existe.' }
    if (!puedeTransicionar(bache.estado, resultado)) {
      return {
        ok: false,
        error: `No se puede pasar de "${ESTADO_LABELS[bache.estado]}" a "${ESTADO_LABELS[resultado]}".`,
      }
    }
    if (patch?.personas !== undefined && !personasValidas(patch.personas)) {
      return { ok: false, error: 'La cantidad de personas debe estar entre 1 y 50.' }
    }
    if (patch?.horas !== undefined && !horasValidas(patch.horas)) {
      return { ok: false, error: 'Las horas deben ser un número entre 0 y 1000.' }
    }
    if (patch?.materialM3 !== undefined && !materialValido(patch.materialM3)) {
      return { ok: false, error: 'El material debe ser un número entre 0 y 10000.' }
    }
    if (patch?.equipoId !== undefined && !equipos.some((e) => e.id === patch.equipoId)) {
      return { ok: false, error: 'El equipo seleccionado no existe.' }
    }

    const fechaCierre = new Date().toISOString()
    const cerrada: Orden = {
      ...orden,
      ...patch,
      equipamiento: patch?.equipamiento
        ? [...patch.equipamiento]
        : orden.equipamiento,
      observaciones:
        patch?.observaciones !== undefined
          ? patch.observaciones.trim() || undefined
          : orden.observaciones,
      estado: 'cerrada',
      resultado,
      fechaCierre,
    }
    setOrdenes((previas) =>
      previas.map((item) => (item.id === id ? { ...item, ...cerrada } : item)),
    )
    setBaches((previos) =>
      previos.map((item) =>
        item.id === bache.id ? { ...item, estado: resultado as EstadoBache } : item,
      ),
    )
    return { ok: true, data: cerrada }
  }

  const guardarAjustes = (nuevos: Ajustes): Resultado<Ajustes> => {
    if (rol !== 'supervisor') {
      return { ok: false, error: 'Solo el supervisor puede cambiar las tarifas.' }
    }
    if (
      !tarifaValida(nuevos.tarifaHora) ||
      !tarifaValida(nuevos.costoMaterialM3) ||
      !tarifaValida(nuevos.costoEquipamiento)
    ) {
      return { ok: false, error: 'Todas las tarifas deben ser números mayores que cero.' }
    }
    setAjustes({ ...nuevos })
    return { ok: true, data: nuevos }
  }

  const restablecerDemo = (): void => {
    borrarDatosDemo()
    const nueva = crearDatosDemo()
    setBaches(nueva.baches)
    setOrdenes(nueva.ordenes)
    setDanos(nueva.danos)
    setAjustes(nueva.ajustes)
  }

  const exportarDatos = (): void => {
    const contenido = JSON.stringify(
      {
        sistema: 'SSRB · Sistema de Seguimiento y Reparación de Baches',
        exportadoEn: new Date().toISOString(),
        datos: { baches, ordenes, danos, ciudadanos, equipos, ajustes },
      },
      null,
      2,
    )
    descargarArchivo(nombreArchivoExportado(), contenido)
  }

  const value: AppContextValue = {
    rol,
    setRol,
    baches,
    ordenes,
    danos,
    ciudadanos,
    equipos,
    ajustes,
    ciudadanoActual,
    ciudadanoActualId: ciudadanoActual?.id,
    storageOk,
    addBache,
    addDano,
    crearOrden,
    actualizarOrden,
    cerrarOrden,
    guardarAjustes,
    restablecerDemo,
    exportarDatos,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return contexto
}

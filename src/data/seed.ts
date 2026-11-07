import type {
  Ajustes,
  Bache,
  Ciudadano,
  Dano,
  Equipo,
  Orden,
  PosicionVia,
} from '../types'
import { calcularPrioridad } from '../lib/rules'

const AJUSTES_POR_DEFECTO: Ajustes = {
  tarifaHora: 25,
  costoMaterialM3: 60,
  costoEquipamiento: 120,
}

const CIUDADANOS: Ciudadano[] = [
  { id: 'CIU-0001', nombre: 'Lucía Fernández', telefono: '555-0101', correo: 'lucia@ejemplo.com' },
  { id: 'CIU-0002', nombre: 'Marco Ruiz', telefono: '555-0102', correo: 'marco@ejemplo.com' },
  { id: 'CIU-0003', nombre: 'Elena Soto', telefono: '555-0103', correo: 'elena@ejemplo.com' },
]

const EQUIPOS: Equipo[] = [
  {
    id: 'EQP-0001',
    nombre: 'Cuadrilla Norte',
    personas: 3,
    equipamiento: ['Compactador', 'Camión volquete'],
  },
  {
    id: 'EQP-0002',
    nombre: 'Cuadrilla Centro',
    personas: 4,
    equipamiento: ['Motoniveladora', 'Compactador', 'Señalización'],
  },
  {
    id: 'EQP-0003',
    nombre: 'Cuadrilla Sur',
    personas: 2,
    equipamiento: ['Retroexcavadora', 'Cortadora de asfalto', 'Señalización'],
  },
]

function haceDias(dias: number, hora = 10): string {
  const valor = new Date()
  valor.setDate(valor.getDate() - dias)
  valor.setHours(hora, 0, 0, 0)
  return valor.toISOString()
}

interface SemillaBache {
  id: string
  calle: string
  altura: string
  distrito: string
  tamano: number
  posicion: PosicionVia
  estado: Bache['estado']
  ciudadanoId?: string
  reportadoPor: Bache['reportadoPor']
  fechaReporte: string
  notas?: string
}

const BACHES_SEMILLA: SemillaBache[] = [
  {
    id: 'BCH-0001',
    calle: 'Av. Central',
    altura: '450',
    distrito: 'Centro',
    tamano: 9,
    posicion: 'medio',
    estado: 'en_proceso',
    ciudadanoId: 'CIU-0001',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(15),
    notas: 'Bache profundo en el carril derecho, genera desvíos.',
  },
  {
    id: 'BCH-0002',
    calle: 'Calle Los Pinos',
    altura: '120',
    distrito: 'Norte',
    tamano: 5,
    posicion: 'cuneta',
    estado: 'no_reparado',
    reportadoPor: 'personal',
    fechaReporte: haceDias(5),
  },
  {
    id: 'BCH-0003',
    calle: 'Av. San Martín',
    altura: '780',
    distrito: 'Sur',
    tamano: 8,
    posicion: 'medio',
    estado: 'reparado',
    ciudadanoId: 'CIU-0002',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(40),
  },
  {
    id: 'BCH-0004',
    calle: 'Calle Las Acacias',
    altura: '55',
    distrito: 'Sur',
    tamano: 3,
    posicion: 'acera',
    estado: 'reparacion_temporal',
    ciudadanoId: 'CIU-0001',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(30),
    notas: 'Se rellenó provisoriamente por lluvias.',
  },
  {
    id: 'BCH-0005',
    calle: 'Av. Los Andes',
    altura: '1200',
    distrito: 'Este',
    tamano: 7,
    posicion: 'borde',
    estado: 'en_proceso',
    reportadoPor: 'personal',
    fechaReporte: haceDias(2),
  },
  {
    id: 'BCH-0006',
    calle: 'Calle La Ribera',
    altura: '90',
    distrito: 'Oeste',
    tamano: 10,
    posicion: 'medio',
    estado: 'no_reparado',
    ciudadanoId: 'CIU-0003',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(1),
    notas: 'Cráter de gran tamaño; se colocó señalización provisoria.',
  },
  {
    id: 'BCH-0007',
    calle: 'Av. del Trabajo',
    altura: '330',
    distrito: 'Oeste',
    tamano: 2,
    posicion: 'cuneta',
    estado: 'reparado',
    reportadoPor: 'personal',
    fechaReporte: haceDias(50),
  },
  {
    id: 'BCH-0008',
    calle: 'Av. de los Álamos',
    altura: '870',
    distrito: 'Norte',
    tamano: 6,
    posicion: 'medio',
    estado: 'reparado',
    ciudadanoId: 'CIU-0002',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(45),
  },
  {
    id: 'BCH-0009',
    calle: 'Calle El Mirador',
    altura: '210',
    distrito: 'Este',
    tamano: 4,
    posicion: 'acera',
    estado: 'no_reparado',
    ciudadanoId: 'CIU-0001',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(7),
  },
  {
    id: 'BCH-0010',
    calle: 'Calle 1 de Mayo',
    altura: '66',
    distrito: 'Centro',
    tamano: 1,
    posicion: 'borde',
    estado: 'en_proceso',
    reportadoPor: 'personal',
    fechaReporte: haceDias(3),
  },
  {
    id: 'BCH-0011',
    calle: 'Calle Los Cedros',
    altura: '505',
    distrito: 'Este',
    tamano: 9,
    posicion: 'cuneta',
    estado: 'reparado',
    ciudadanoId: 'CIU-0003',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(60),
  },
  {
    id: 'BCH-0012',
    calle: 'Calle El Progreso',
    altura: '145',
    distrito: 'Sur',
    tamano: 5,
    posicion: 'medio',
    estado: 'no_reparado',
    ciudadanoId: 'CIU-0001',
    reportadoPor: 'ciudadano',
    fechaReporte: haceDias(10),
  },
]

const ORDENES: Orden[] = [
  {
    id: 'ORD-0001',
    bacheId: 'BCH-0001',
    equipoId: 'EQP-0002',
    personas: 4,
    equipamiento: ['Motoniveladora', 'Compactador', 'Señalización'],
    horas: 6,
    materialM3: 2.5,
    estado: 'abierta',
    fechaCreacion: haceDias(14, 8),
    observaciones: 'Se retiró material suelto y se preparó la base.',
  },
  {
    id: 'ORD-0002',
    bacheId: 'BCH-0003',
    equipoId: 'EQP-0003',
    personas: 3,
    equipamiento: ['Retroexcavadora', 'Cortadora de asfalto', 'Señalización'],
    horas: 10,
    materialM3: 4,
    estado: 'cerrada',
    resultado: 'reparado',
    fechaCreacion: haceDias(38, 9),
    fechaCierre: haceDias(35, 16),
  },
  {
    id: 'ORD-0003',
    bacheId: 'BCH-0004',
    equipoId: 'EQP-0003',
    personas: 2,
    equipamiento: ['Retroexcavadora', 'Señalización'],
    horas: 4,
    materialM3: 1.5,
    estado: 'cerrada',
    resultado: 'reparacion_temporal',
    fechaCreacion: haceDias(29, 9),
    fechaCierre: haceDias(27, 15),
    observaciones: 'Relleno provisorio por lluvias; requiere intervención definitiva.',
  },
  {
    id: 'ORD-0004',
    bacheId: 'BCH-0005',
    equipoId: 'EQP-0001',
    personas: 3,
    equipamiento: ['Compactador', 'Camión volquete'],
    horas: 2,
    materialM3: 0.5,
    estado: 'abierta',
    fechaCreacion: haceDias(1, 9),
  },
  {
    id: 'ORD-0005',
    bacheId: 'BCH-0007',
    equipoId: 'EQP-0001',
    personas: 3,
    equipamiento: ['Compactador', 'Camión volquete'],
    horas: 8,
    materialM3: 3,
    estado: 'cerrada',
    resultado: 'reparado',
    fechaCreacion: haceDias(48, 8),
    fechaCierre: haceDias(46, 14),
  },
  {
    id: 'ORD-0006',
    bacheId: 'BCH-0008',
    equipoId: 'EQP-0002',
    personas: 4,
    equipamiento: ['Motoniveladora', 'Compactador', 'Señalización'],
    horas: 12,
    materialM3: 5,
    estado: 'cerrada',
    resultado: 'reparado',
    fechaCreacion: haceDias(43, 8),
    fechaCierre: haceDias(40, 17),
  },
  {
    id: 'ORD-0007',
    bacheId: 'BCH-0010',
    equipoId: 'EQP-0002',
    personas: 2,
    equipamiento: ['Compactador', 'Señalización'],
    horas: 1,
    materialM3: 0,
    estado: 'abierta',
    fechaCreacion: haceDias(2, 11),
  },
  {
    id: 'ORD-0008',
    bacheId: 'BCH-0011',
    equipoId: 'EQP-0003',
    personas: 2,
    equipamiento: ['Retroexcavadora', 'Cortadora de asfalto', 'Señalización'],
    horas: 7,
    materialM3: 2.5,
    estado: 'cerrada',
    resultado: 'reparado',
    fechaCreacion: haceDias(58, 9),
    fechaCierre: haceDias(55, 15),
  },
]

const DANOS: Dano[] = [
  {
    id: 'DAN-0001',
    bacheId: 'BCH-0001',
    ciudadanoId: 'CIU-0002',
    nombre: 'Marco Ruiz',
    direccion: 'Av. Central 450',
    telefono: '555-0102',
    tipo: 'llanta',
    monto: 180,
    fecha: haceDias(12, 18),
  },
  {
    id: 'DAN-0002',
    bacheId: 'BCH-0003',
    ciudadanoId: 'CIU-0001',
    nombre: 'Lucía Fernández',
    direccion: 'Av. San Martín 780',
    telefono: '555-0101',
    tipo: 'suspension',
    monto: 420,
    fecha: haceDias(36, 19),
  },
  {
    id: 'DAN-0003',
    bacheId: 'BCH-0006',
    ciudadanoId: 'CIU-0003',
    nombre: 'Elena Soto',
    direccion: 'Calle La Ribera 90',
    telefono: '555-0103',
    tipo: 'llanta',
    monto: 260,
    fecha: haceDias(1, 20),
  },
]

export function crearDatosDemo() {
  const baches: Bache[] = BACHES_SEMILLA.map((bache) => ({
    id: bache.id,
    calle: bache.calle,
    altura: bache.altura,
    direccion: `${bache.calle} ${bache.altura}`,
    distrito: bache.distrito,
    tamano: bache.tamano,
    posicion: bache.posicion,
    prioridad: calcularPrioridad(bache.tamano),
    estado: bache.estado,
    reportadoPor: bache.reportadoPor,
    ciudadanoId: bache.ciudadanoId,
    notas: bache.notas,
    fechaReporte: bache.fechaReporte,
  }))

  return {
    baches,
    ordenes: ORDENES.map((orden) => ({ ...orden, equipamiento: [...orden.equipamiento] })),
    danos: DANOS.map((dano) => ({ ...dano })),
    ciudadanos: CIUDADANOS.map((ciudadano) => ({ ...ciudadano })),
    equipos: EQUIPOS.map((equipo) => ({
      ...equipo,
      equipamiento: [...equipo.equipamiento],
    })),
    ajustes: { ...AJUSTES_POR_DEFECTO },
  }
}

export const AJUSTES_INICIALES: Ajustes = { ...AJUSTES_POR_DEFECTO }

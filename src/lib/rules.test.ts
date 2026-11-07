import { describe, expect, it } from 'vitest'
import type { Ajustes } from '../types'
import {
  calcularCosto,
  calcularPrioridad,
  desglosarCosto,
  puedeTransicionar,
  transicionesDisponibles,
} from './rules'

const AJUSTES: Ajustes = {
  tarifaHora: 25,
  costoMaterialM3: 60,
  costoEquipamiento: 120,
}

describe('calcularPrioridad (RF-04)', () => {
  it('asigna prioridad baja a los tamaños 1 a 3', () => {
    expect(calcularPrioridad(1)).toBe('baja')
    expect(calcularPrioridad(2)).toBe('baja')
    expect(calcularPrioridad(3)).toBe('baja')
  })

  it('asigna prioridad media a los tamaños 4 a 7', () => {
    expect(calcularPrioridad(4)).toBe('media')
    expect(calcularPrioridad(5)).toBe('media')
    expect(calcularPrioridad(7)).toBe('media')
  })

  it('asigna prioridad alta a los tamaños 8 a 10 (criterio: tamaño 9)', () => {
    expect(calcularPrioridad(8)).toBe('alta')
    expect(calcularPrioridad(9)).toBe('alta')
    expect(calcularPrioridad(10)).toBe('alta')
  })

  it('rechaza tamaños fuera del rango 1-10 o no enteros', () => {
    expect(() => calcularPrioridad(0)).toThrow()
    expect(() => calcularPrioridad(11)).toThrow()
    expect(() => calcularPrioridad(4.5)).toThrow()
  })
})

describe('calcularCosto (RF-07)', () => {
  const orden = {
    horas: 8,
    personas: 3,
    materialM3: 2,
    equipamiento: ['Compactador'],
  }

  it('aplica la fórmula completa', () => {
    // 8 * 3 * 25 = 600 | 2 * 60 = 120 | equipamiento = 120 → 840
    expect(calcularCosto(orden, AJUSTES)).toBe(840)
    expect(desglosarCosto(orden, AJUSTES)).toEqual({
      manoObra: 600,
      material: 120,
      equipamiento: 120,
      total: 840,
    })
  })

  it('no cobra equipamiento si la orden no tiene equipamiento asignado', () => {
    expect(calcularCosto({ ...orden, equipamiento: [] }, AJUSTES)).toBe(720)
  })

  it('redondea a dos decimales', () => {
    const resultado = calcularCosto(
      { horas: 1.25, personas: 3, materialM3: 0.5, equipamiento: [] },
      { tarifaHora: 25.5, costoMaterialM3: 60.25, costoEquipamiento: 100 },
    )
    // 1.25*3*25.5 = 95.625 | 0.5*60.25 = 30.125 → 125.75
    expect(resultado).toBe(125.75)
  })

  it('considera cero horas o material como costo cero en esa parte', () => {
    expect(
      calcularCosto(
        { horas: 0, personas: 4, materialM3: 0, equipamiento: [] },
        AJUSTES,
      ),
    ).toBe(0)
  })
})

describe('transiciones de estado', () => {
  it('permite las transiciones del flujo definido', () => {
    expect(puedeTransicionar('no_reparado', 'en_proceso')).toBe(true)
    expect(puedeTransicionar('en_proceso', 'reparado')).toBe(true)
    expect(puedeTransicionar('en_proceso', 'reparacion_temporal')).toBe(true)
    expect(puedeTransicionar('en_proceso', 'no_reparado')).toBe(true)
    expect(puedeTransicionar('reparacion_temporal', 'en_proceso')).toBe(true)
  })

  it('bloquea transiciones no permitidas', () => {
    expect(puedeTransicionar('no_reparado', 'reparado')).toBe(false)
    expect(puedeTransicionar('no_reparado', 'reparacion_temporal')).toBe(false)
    expect(puedeTransicionar('reparado', 'en_proceso')).toBe(false)
    expect(puedeTransicionar('reparado', 'no_reparado')).toBe(false)
    expect(puedeTransicionar('reparacion_temporal', 'reparado')).toBe(false)
    expect(puedeTransicionar('en_proceso', 'en_proceso')).toBe(false)
  })

  it('reparado es un estado terminal', () => {
    expect(transicionesDisponibles('reparado')).toHaveLength(0)
  })
})

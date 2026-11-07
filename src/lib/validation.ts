export function textoRequerido(valor: string, minimo = 1): boolean {
  return valor.trim().length >= minimo
}

/** Acepta +, espacios, guiones y paréntesis, con entre 7 y 15 dígitos. */
export function telefonoValido(valor: string): boolean {
  const limpio = valor.trim()
  if (!/^[+\d\s()-]+$/.test(limpio)) return false
  const digitos = limpio.replace(/\D/g, '')
  return digitos.length >= 7 && digitos.length <= 15
}

export function montoValido(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0
}

export function horasValidas(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0 && valor <= 1000
}

export function materialValido(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0 && valor <= 10000
}

export function personasValidas(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 1 && valor <= 50
}

export function tarifaValida(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0 && valor <= 100000
}

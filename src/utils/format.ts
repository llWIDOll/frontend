/**
 * Utilidades de formateo para BiteBord
 */

/**
 * Formatea un número o string a formato de moneda con separador de miles (punto) y sin decimales.
 * Soluciona el problema de Hydration Mismatch forzando siempre el locale 'es-CO'.
 * @example formatCurrency(5000) // "5.000"
 * @example formatCurrency("2500.50") // "2.500"
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0'
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numericValue)) return '0'

  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(numericValue)
}

/**
 * Convierte un string formateado con puntos de vuelta a un número limpio para la Base de Datos.
 * @example parseCurrency("5.000") // 5000
 */
export function parseCurrency(value: string): number {
  if (!value) return 0
  // Removemos todo lo que no sea dígito
  const cleanString = value.replace(/\D/g, '')
  return parseInt(cleanString, 10) || 0
}

/**
 * Convierte un ISO string (ej: "2026-03-11T18:44:41") a un string formateado local.
 * Si el string no incluye un indicador de Timezone (Z o +00:00), se asume que es UTC
 * para corregir el desfase de 5 horas de Colombia frente al timezone 0 de Supabase.
 */
export function formatLocalTime(isoString: string): string {
  if (!isoString) return ''
  const hasTimezone = isoString.endsWith('Z') || isoString.includes('+') || isoString.includes('-') && isoString.split('T')[1]?.includes('-')
  
  // Si no trae huso horario, forzamos UTC agregando 'Z'
  const finalString = hasTimezone ? isoString : `${isoString}Z`
  
  const dateObj = new Date(finalString)
  if (isNaN(dateObj.getTime())) return ''

  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj)
}

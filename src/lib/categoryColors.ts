export const categoryColors: Record<string, string> = {
  Vivienda: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Alimentación: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Transporte: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Salud: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  Educación: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Ocio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'Ropa y calzado': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Suscripciones: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  Servicios: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  Otro: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Super: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Comida: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Alquiler: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  OCIO: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  Viaje: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Devolucion: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

export function categoryBadgeClass(category: string): string {
  return categoryColors[category] ?? categoryColors.Otro
}
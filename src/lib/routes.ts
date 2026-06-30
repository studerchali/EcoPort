/** Ruta base de la aplicación autenticada */
export const APP_BASE = '/app'

export const APP_ROUTES = {
  dashboard: APP_BASE,
  ingresos: `${APP_BASE}/ingresos`,
  gastos: `${APP_BASE}/gastos`,
  transacciones: `${APP_BASE}/transacciones`,
  balance: `${APP_BASE}/balance`,
  inversiones: `${APP_BASE}/inversiones`,
} as const
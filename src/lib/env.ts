/** Activa bypass de autenticación solo en desarrollo (valor exacto: "true"). */
export function isPublicAccessEnabled(): boolean {
  return import.meta.env.VITE_ALLOW_PUBLIC_ACCESS === 'true'
}
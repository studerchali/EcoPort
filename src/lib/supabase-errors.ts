/** Supabase/PostgREST no encuentra la tabla (migración no aplicada). */
export function isMissingTableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code)
      : ''
  return (
    code === 'PGRST205' ||
    message.includes('Could not find the table') ||
    message.includes('PGRST205') ||
    message.includes('schema cache')
  )
}

export const SCHEMA_SETUP_MESSAGE =
  'La base de datos no está configurada. Ejecuta supabase/migrations/001_initial_schema.sql en el SQL Editor de Supabase.'
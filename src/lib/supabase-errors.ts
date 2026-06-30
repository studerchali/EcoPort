/** Supabase/PostgREST no encuentra la tabla (migración no aplicada). */
export function isMissingTableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('Could not find the table') ||
    message.includes('PGRST205') ||
    message.includes('schema cache')
  )
}
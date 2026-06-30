import { AlertCircle } from 'lucide-react'

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 rounded-lg border border-expense/30 bg-expense/5 px-3 py-2 text-sm text-expense">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
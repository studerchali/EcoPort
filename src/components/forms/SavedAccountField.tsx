import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAccountSuggestions } from '@/hooks/useAccountSuggestions'

interface SavedAccountFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function SavedAccountField({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Ej. Santander, Efectivo…',
}: SavedAccountFieldProps) {
  const suggestions = useAccountSuggestions()
  const listId = id ? `${id}-accounts` : 'saved-accounts-list'

  return (
    <div className="space-y-2">
      <Input
        id={id}
        list={listId}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      <datalist id={listId}>
        {suggestions.map((account) => (
          <option key={account} value={account} />
        ))}
      </datalist>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((account) => (
            <button
              key={account}
              type="button"
              disabled={disabled}
              onClick={() => onChange(account)}
              className={cn(
                'rounded-md border px-2 py-0.5 text-xs transition-colors',
                value === account
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {account}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
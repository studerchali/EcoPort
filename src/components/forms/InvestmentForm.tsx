import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useInvestments } from '@/contexts/InvestmentsContext'
import type { Currency } from '@/types/finance'
import type { Investment } from '@/types/database'
import { cn } from '@/lib/utils'

interface InvestmentFormProps {
  initial?: Investment
  onSuccess?: () => void
  compact?: boolean
}

export function InvestmentForm({
  initial,
  onSuccess,
  compact,
}: InvestmentFormProps) {
  const { addInvestment, updateInvestment } = useInvestments()
  const [submitting, setSubmitting] = useState(false)

  const [asset, setAsset] = useState(initial?.asset ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? 'IBKR')
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''))
  const [buyPrice, setBuyPrice] = useState(String(initial?.buy_price ?? ''))
  const [currentPrice, setCurrentPrice] = useState(
    String(initial?.current_price ?? '')
  )
  const [currency, setCurrency] = useState<Currency>(
    initial?.currency ?? 'USD'
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedQty = parseFloat(quantity)
    const parsedBuy = parseFloat(buyPrice)
    const parsedCurrent = parseFloat(currentPrice)

    if (
      !asset.trim() ||
      !platform.trim() ||
      !parsedQty ||
      parsedQty <= 0 ||
      parsedBuy < 0 ||
      parsedCurrent < 0
    ) {
      toast.error('Completa los campos obligatorios')
      return
    }

    const data = {
      asset: asset.trim(),
      platform: platform.trim(),
      quantity: parsedQty,
      buy_price: parsedBuy,
      current_price: parsedCurrent || parsedBuy,
      currency,
      notes: notes.trim() || null,
    }

    setSubmitting(true)
    try {
      if (initial) {
        await updateInvestment(initial.id, data)
        toast.success('Inversión actualizada')
      } else {
        await addInvestment(data)
        toast.success('Inversión añadida')
        setAsset('')
        setQuantity('')
        setBuyPrice('')
        setCurrentPrice('')
        setNotes('')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = compact ? 'min-h-10' : ''
  const labelClass = compact ? 'text-sm' : ''

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', compact && 'space-y-3')}>
      <div
        className={cn(
          'grid gap-4',
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2'
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="inv-asset" className={labelClass}>
            Activo / Ticker
          </Label>
          <Input
            id="inv-asset"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="VWCE, MSFT…"
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-platform" className={labelClass}>
            Plataforma
          </Label>
          <Input
            id="inv-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="IBKR, TradeRepublic…"
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-qty" className={labelClass}>
            Cantidad
          </Label>
          <Input
            id="inv-qty"
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-currency" className={labelClass}>
            Moneda
          </Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger id="inv-currency" className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-buy" className={labelClass}>
            Precio de compra
          </Label>
          <Input
            id="inv-buy"
            type="number"
            step="any"
            min="0"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-current" className={labelClass}>
            Precio actual
          </Label>
          <Input
            id="inv-current"
            type="number"
            step="any"
            min="0"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="Igual que compra si vacío"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inv-notes" className={labelClass}>
          Notas (opcional)
        </Label>
        <Textarea
          id="inv-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={compact ? 2 : 3}
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initial ? 'Guardar cambios' : 'Añadir inversión'}
      </Button>
    </form>
  )
}
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AccountTotal } from '@/lib/calculations'
import { usePrivacyFormat } from '@/hooks/usePrivacyFormat'
import { HIDDEN_NUMBER } from '@/lib/format'

interface AccountChartProps {
  data: AccountTotal[]
}

export function AccountChart({ data }: AccountChartProps) {
  const { hideSensitiveData, formatMoney, formatShare } = usePrivacyFormat()

  const chartData = data
    .filter((d) => d.incomeEUR > 0 || d.expenseEUR > 0)
    .map((d) => ({
      name: d.account.length > 12 ? d.account.slice(0, 12) + '…' : d.account,
      neto: Math.round(d.netEUR * 100) / 100,
    }))

  const totalAbs = chartData.reduce((s, d) => s + Math.abs(d.neto), 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribución por cuenta</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sin movimientos por cuenta
        </CardContent>
      </Card>
    )
  }

  const tickFormatter = hideSensitiveData
    ? () => HIDDEN_NUMBER
    : (v: number) => formatMoney(v)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribución por cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={tickFormatter} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => {
                const num = Number(value)
                return hideSensitiveData
                  ? formatShare(Math.abs(num), totalAbs)
                  : formatMoney(num)
              }}
            />
            <Bar dataKey="neto" name="Neto EUR" fill="hsl(175 50% 40%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
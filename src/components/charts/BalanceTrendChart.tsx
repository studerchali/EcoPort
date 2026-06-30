import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BalanceTrendPoint } from '@/lib/calculations'
import { usePrivacyFormat } from '@/hooks/usePrivacyFormat'
import { HIDDEN_NUMBER } from '@/lib/format'

interface BalanceTrendChartProps {
  data: BalanceTrendPoint[]
}

export function BalanceTrendChart({ data }: BalanceTrendChartProps) {
  const { hideSensitiveData, formatMoney, formatShare } = usePrivacyFormat()

  const hasData = data.some((d) => d.balance !== 0 || d.cumulative !== 0)
  const maxCumulative = Math.max(...data.map((d) => Math.abs(d.cumulative)), 1)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencia de balance acumulado</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sin datos de balance para mostrar
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
        <CardTitle className="text-base">Tendencia de balance acumulado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={tickFormatter} />
            <Tooltip
              formatter={(value) => {
                const num = Number(value)
                return hideSensitiveData
                  ? formatShare(Math.abs(num), maxCumulative)
                  : formatMoney(num)
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Balance acumulado"
              stroke="hsl(220 60% 45%)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
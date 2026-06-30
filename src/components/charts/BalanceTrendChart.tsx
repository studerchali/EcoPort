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
import { formatCurrency } from '@/lib/format'

interface BalanceTrendChartProps {
  data: BalanceTrendPoint[]
}

export function BalanceTrendChart({ data }: BalanceTrendChartProps) {
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
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
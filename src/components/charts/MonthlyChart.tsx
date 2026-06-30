import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlyBalanceRow } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'

interface MonthlyChartProps {
  data: MonthlyBalanceRow[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.map((d) => ({
    name: d.month.slice(0, 3),
    ingresos: Math.round(d.incomeEUR * 100) / 100,
    gastos: Math.round(d.expenseEUR * 100) / 100,
  }))

  const hasData = chartData.some((d) => d.ingresos > 0 || d.gastos > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingresos vs Gastos mensual</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sin movimientos en {data[0]?.year ?? 'este año'}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingresos vs Gastos mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 8 }}
            />
            <Legend />
            <Bar dataKey="ingresos" name="Ingresos" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
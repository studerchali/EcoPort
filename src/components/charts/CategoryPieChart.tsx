import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryTotal } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'

const COLORS = [
  '#0f766e', '#dc2626', '#2563eb', '#ca8a04', '#9333ea',
  '#0891b2', '#ea580c', '#4f46e5', '#16a34a',
]

interface CategoryPieChartProps {
  data: CategoryTotal[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.category,
    value: Math.round(d.totalEUR * 100) / 100,
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos por categoría</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sin gastos registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gastos por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
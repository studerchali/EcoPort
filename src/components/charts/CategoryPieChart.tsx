import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryTotal } from '@/lib/calculations'
import { usePrivacyFormat } from '@/hooks/usePrivacyFormat'

const COLORS = [
  '#0f766e', '#dc2626', '#2563eb', '#ca8a04', '#9333ea',
  '#0891b2', '#ea580c', '#4f46e5', '#16a34a',
]

interface CategoryPieChartProps {
  data: CategoryTotal[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { hideSensitiveData, formatMoney, formatShare } = usePrivacyFormat()

  const chartData = data.map((d) => ({
    name: d.category,
    value: Math.round(d.totalEUR * 100) / 100,
  }))

  const total = chartData.reduce((s, d) => s + d.value, 0)

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
            <Tooltip
              formatter={(value) =>
                hideSensitiveData
                  ? formatShare(Number(value), total)
                  : formatMoney(Number(value))
              }
            />
            <Legend
              formatter={(value) => {
                const item = chartData.find((d) => d.name === value)
                if (!item) return value
                if (hideSensitiveData) {
                  return `${value} (${formatShare(item.value, total)})`
                }
                return `${value} (${formatMoney(item.value)})`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {hideSensitiveData && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Montos ocultos — leyenda en porcentajes
          </p>
        )}
      </CardContent>
    </Card>
  )
}
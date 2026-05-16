import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RevenueChartProps {
  data: Array<{
    category: string
    revenue: number
    count: number
  }>
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    revenue_millions: d.revenue / 1000000,
  }))

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `Rp ${v}M`} />
            <YAxis type="category" dataKey="category" width={100} />
            <Tooltip
              formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue_millions" name="Revenue">
              {formattedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
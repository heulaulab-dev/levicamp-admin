import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface OccupancyChartProps {
  data: Array<{
    date: string
    rate: number
    last_year?: number
  }>
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
  }))

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Occupancy Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#2563eb"
              strokeWidth={2}
              name="This Year"
              dot={false}
            />
            {formattedData[0]?.last_year !== undefined && (
              <Line
                type="monotone"
                dataKey="last_year"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Last Year"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
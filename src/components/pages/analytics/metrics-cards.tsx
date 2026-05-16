import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, Bed } from 'lucide-react'

interface MetricsCardsProps {
  metrics: {
    occupancy: number
    revenue_mtd: number
    booking_rate: number
    avg_stay: number
  }
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Current Occupancy',
      value: `${metrics.occupancy.toFixed(1)}%`,
      icon: Bed,
      change: '+5.2%',
      positive: true,
    },
    {
      title: 'Revenue MTD',
      value: `Rp ${(metrics.revenue_mtd / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      change: '+12.3%',
      positive: true,
    },
    {
      title: 'Booking Rate',
      value: `${metrics.booking_rate.toFixed(1)}%`,
      icon: TrendingUp,
      change: metrics.booking_rate >= 0 ? '+' : '',
      positive: metrics.booking_rate >= 0,
    },
    {
      title: 'Avg Stay Duration',
      value: `${metrics.avg_stay.toFixed(1)} nights`,
      icon: Calendar,
      change: '-0.3',
      positive: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className={`text-xs ${card.positive ? 'text-green-600' : 'text-red-600'}`}>
              {card.change} from last period
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
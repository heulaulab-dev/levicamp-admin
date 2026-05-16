'use client'

import { useCallback, useEffect, useState } from 'react'
import { MetricsCards } from '@/components/pages/analytics/metrics-cards'
import { OccupancyChart } from '@/components/pages/analytics/occupancy-chart'
import { RevenueChart } from '@/components/pages/analytics/revenue-chart'
import { BookingsTable } from '@/components/pages/analytics/bookings-table'
import { Filters } from '@/components/pages/analytics/filters'
import { Skeleton } from '@/components/ui/skeleton'
import { getAnalyticsOverview, AnalyticsOverview } from '@/lib/analytics-api'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [categoryId, setCategoryId] = useState('all')
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const daysBack = dateRange === 'month' ? 30 : dateRange === 'year' ? 365 : parseInt(dateRange)
      const startDate = new Date(
        Date.now() - daysBack * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0]

      const data = await getAnalyticsOverview({
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId !== 'all' ? categoryId : undefined,
      })
      setOverview(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, categoryId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Monitor your camping business performance</p>
      </div>

      <Filters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        onRefresh={fetchData}
      />

      <MetricsCards metrics={overview?.metrics || {
        occupancy: 0,
        revenue_mtd: 0,
        booking_rate: 0,
        avg_stay: 0,
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart data={overview?.occupancy_trend || []} />
        <RevenueChart data={overview?.revenue_by_category || []} />
      </div>

      <BookingsTable bookings={overview?.recent_bookings || []} />
    </div>
  )
}
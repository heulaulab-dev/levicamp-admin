import api from './api'

export interface AnalyticsMetrics {
  occupancy: number
  revenue_mtd: number
  booking_rate: number
  avg_stay: number
}

export interface OccupancyTrend {
  date: string
  rate: number
  last_year?: number
}

export interface RevenueCategory {
  category: string
  revenue: number
  count: number
}

export interface RecentBooking {
  id: string
  code: string
  guest: string
  amount: number
  status: string
  date: string
}

export interface AnalyticsOverview {
  metrics: AnalyticsMetrics
  occupancy_trend: OccupancyTrend[]
  revenue_by_category: RevenueCategory[]
  recent_bookings: RecentBooking[]
}

export const getAnalyticsOverview = async (params?: {
  start_date?: string
  end_date?: string
  category_id?: string
}): Promise<AnalyticsOverview> => {
  const response = await api.get('/admin/analytics/overview', { params })
  return response.data.data
}

export const exportAnalytics = async (params?: {
  start_date?: string
  end_date?: string
  category_id?: string
  format?: 'csv' | 'json'
}) => {
  const response = await api.get('/admin/analytics/export', {
    params,
    responseType: params?.format === 'json' ? 'json' : 'blob'
  })
  return response.data
}
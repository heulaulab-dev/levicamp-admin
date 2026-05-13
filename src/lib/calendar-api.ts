import api from './api'

export interface AvailabilityDate {
  date: string
  status: 'available' | 'limited' | 'full' | 'blocked'
  available_count: number
  tents?: Array<{
    id: string
    name: string
    price: number
  }>
}

export interface CalendarBlock {
  id: string
  tent_id: string
  tent_name: string
  start_date: string
  end_date: string
  reason: string
  created_at: string
}

export const getCalendarAvailability = async (params: {
  start_date: string
  end_date: string
  tent_category_id?: string
}): Promise<{ dates: AvailabilityDate[] }> => {
  const response = await api.get('/calendar/availability', { params })
  return response.data.data
}

export const getCalendarBlocks = async (): Promise<CalendarBlock[]> => {
  const response = await api.get('/admin/calendar/blocks')
  return response.data.data
}

export const createCalendarBlock = async (data: {
  tent_id: string
  start_date: string
  end_date: string
  reason: string
}): Promise<{ success: boolean; block_id: string }> => {
  const response = await api.post('/admin/calendar/block', data)
  return response.data.data
}

export const deleteCalendarBlock = async (blockId: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/admin/calendar/block/${blockId}`)
  return response.data.data
}
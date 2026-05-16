'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AvailabilityCalendar } from '@/components/ui/calendar/availability-calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCalendarBlocks,
  createCalendarBlock,
  deleteCalendarBlock,
  CalendarBlock,
} from '@/lib/calendar-api'

export default function CalendarManagementPage() {
  const [blocks, setBlocks] = useState<CalendarBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [tentId, setTentId] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchBlocks()
  }, [])

  const fetchBlocks = async () => {
    setLoading(true)
    try {
      const data = await getCalendarBlocks()
      setBlocks(data)
    } catch (error) {
      toast.error('Failed to load calendar blocks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlock = async () => {
    if (selectedDates.length < 2 || !tentId) {
      toast.error('Please select date range and tent')
      return
    }

    try {
      await createCalendarBlock({
        tent_id: tentId,
        start_date: selectedDates[0].toISOString().split('T')[0],
        end_date: selectedDates[1].toISOString().split('T')[0],
        reason,
      })
      toast.success('Block created successfully')
      setSelectedDates([])
      setReason('')
      fetchBlocks()
    } catch (error) {
      toast.error('Failed to create block')
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteCalendarBlock(blockId)
      toast.success('Block deleted successfully')
      fetchBlocks()
    } catch (error) {
      toast.error('Failed to delete block')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Management</h1>
        <p className="text-muted-foreground">
          Manage tent availability and block dates for maintenance or events
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Block Dates</h2>
          <AvailabilityCalendar
            selected={selectedDates}
            onSelect={setSelectedDates}
          />

          <div className="space-y-2">
            <Select value={tentId} onValueChange={setTentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select tent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Select a tent</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Reason (e.g., Maintenance)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Button onClick={handleCreateBlock} className="w-full">
              Create Block
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Blocks</h2>
          <div className="border rounded-lg divide-y">
            {blocks.map((block) => (
              <div key={block.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{block.tent_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {block.start_date} to {block.end_date}
                  </p>
                  {block.reason && (
                    <p className="text-sm text-muted-foreground">{block.reason}</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteBlock(block.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            {blocks.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">No active blocks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
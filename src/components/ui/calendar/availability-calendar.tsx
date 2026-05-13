'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface AvailabilityCalendarProps {
  selected: Date[]
  onSelect: (dates: Date[]) => void
}

export function AvailabilityCalendar({
  selected,
  onSelect,
}: AvailabilityCalendarProps) {
  const [month, setMonth] = useState(new Date())

  const handleSelect = (dates: Date | Date[] | undefined) => {
    if (!dates) {
      onSelect([])
      return
    }
    if (Array.isArray(dates)) {
      onSelect(dates)
    } else {
      onSelect([dates])
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={handleSelect}
        month={month}
        onMonthChange={setMonth}
        classNames={{
          months: 'relative',
          caption: 'flex justify-center items-center py-4',
          nav: 'flex gap-1 absolute right-0 top-4',
        }}
      />
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 rounded" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded" />
          <span>Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  )
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface FiltersProps {
  dateRange: string
  onDateRangeChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  onRefresh: () => void
}

const dateRangeOptions = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
]

export function Filters({
  dateRange,
  onDateRangeChange,
  categoryId,
  onCategoryChange,
  onRefresh,
}: FiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-[180px]">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  )
}
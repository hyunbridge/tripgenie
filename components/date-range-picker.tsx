"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { PlaneTakeoff, PlaneLanding } from "lucide-react"
import { format, isValid } from "date-fns"

interface DatePickerWithRangeProps {
  startDate?: string
  endDate?: string
  onDateChange?: (startDate: string | null, endDate: string | null) => void
  className?: string
}

export function DatePickerWithRange({ 
  startDate = "", 
  endDate = "", 
  onDateChange,
  className 
}: DatePickerWithRangeProps) {
  const [startInputValue, setStartInputValue] = React.useState("")
  const [endInputValue, setEndInputValue] = React.useState("")

  React.useEffect(() => {
    if (startDate) {
      const date = new Date(startDate)
      setStartInputValue(`${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`)
    }
    if (endDate) {
      const date = new Date(endDate)
      setEndInputValue(`${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`)
    }
  }, [startDate, endDate])

  const formatValue = (numbers: string) => {
    if (numbers.length === 0) return ""
    let result = numbers.slice(0, 4)
    if (numbers.length >= 4) {
      result += "년 " + numbers.slice(4, 6)
      if (numbers.length >= 6) {
        result += "월 " + numbers.slice(6, 8) + "일"
      }
    }
    return result
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numbers = value.replace(/\D/g, '').slice(0, 8)
    setStartInputValue(formatValue(numbers))
    
    if (numbers.length === 8) {
      const year = numbers.slice(0, 4)
      const month = numbers.slice(4, 6)
      const day = numbers.slice(6, 8)
      const dateStr = `${year}-${month}-${day}`
      const date = new Date(dateStr)
      
      if (isValid(date)) {
        onDateChange?.(format(date, 'yyyy-MM-dd'), endDate || null)
      }
    } else if (numbers.length === 0) {
      onDateChange?.(null, endDate || null)
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numbers = value.replace(/\D/g, '').slice(0, 8)
    setEndInputValue(formatValue(numbers))
    
    if (numbers.length === 8) {
      const year = numbers.slice(0, 4)
      const month = numbers.slice(4, 6)
      const day = numbers.slice(6, 8)
      const dateStr = `${year}-${month}-${day}`
      const date = new Date(dateStr)
      
      if (isValid(date)) {
        onDateChange?.(startDate || null, format(date, 'yyyy-MM-dd'))
      }
    } else if (numbers.length === 0) {
      onDateChange?.(startDate || null, null)
    }
  }

  const handleKeyDown = (isStart: boolean) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const currentValue = isStart ? startInputValue : endInputValue
      const numbers = currentValue.replace(/\D/g, '')
      const newNumbers = numbers.slice(0, -1)
      if (isStart) {
        setStartInputValue(formatValue(newNumbers))
        if (newNumbers.length === 0) {
          onDateChange?.(null, endDate || null)
        }
      } else {
        setEndInputValue(formatValue(newNumbers))
        if (newNumbers.length === 0) {
          onDateChange?.(startDate || null, null)
        }
      }
    }
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-3", className)}>
      {/* 출발일 */}
      <div className="relative">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">출발일</label>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              value={startInputValue}
              onChange={handleStartChange}
              onKeyDown={handleKeyDown(true)}
              placeholder="YYYYMMDD"
              className="pl-9"
            />
            <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 도착일 */}
      <div className="relative">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">도착일</label>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              value={endInputValue}
              onChange={handleEndChange}
              onKeyDown={handleKeyDown(false)}
              placeholder="YYYYMMDD"
              className="pl-9"
            />
            <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

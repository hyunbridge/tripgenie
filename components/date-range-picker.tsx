"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (startDate: string | null, endDate: string | null) => void
}

export function DatePickerWithRange({ className, onDateChange }: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  // 이전 날짜 값을 저장하는 ref
  const prevDatesRef = React.useRef<{
    fromDate: string | null;
    toDate: string | null;
  }>({
    fromDate: null,
    toDate: null
  });

  // PopoverTrigger를 위한 참조 생성
  const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (date?.from && date?.to && onDateChange) {
      const fromDate = format(date.from, "yyyy-MM-dd");
      const toDate = format(date.to, "yyyy-MM-dd");

      // 값이 변경된 경우에만 콜백 호출
      if (fromDate !== prevDatesRef.current.fromDate ||
          toDate !== prevDatesRef.current.toDate) {

        // 현재 값 저장
        prevDatesRef.current.fromDate = fromDate;
        prevDatesRef.current.toDate = toDate;

        onDateChange(fromDate, toDate);
      }
    }
  }, [date?.from, date?.to, onDateChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={popoverTriggerRef}
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white/80 border-slate-200",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PPP", { locale: ko })} - {format(date.to, "PPP", { locale: ko })}
                </>
              ) : (
                format(date.from, "PPP", { locale: ko })
              )
            ) : (
              <span>날짜를 선택하세요</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={ko}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

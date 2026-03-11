"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { endOfDay, format, startOfDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const PRESETS = [
  { label: "Ultimos 7 dias", days: 7 },
  { label: "Ultimos 14 dias", days: 14 },
  { label: "Ultimos 30 dias", days: 30 },
  { label: "Ultimos 90 dias", days: 90 },
]

interface DateRangePickerProps {
  className?: string
}

export function DateRangePicker({ className }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<DateRange | undefined>(
    fromParam && toParam
      ? {
          from: startOfDay(new Date(fromParam)),
          to: startOfDay(new Date(toParam)),
        }
      : undefined
  )

  function navigate(from: Date, to: Date) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("from", startOfDay(from).toISOString())
    params.set("to", endOfDay(to).toISOString())
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSelect(range: DateRange | undefined) {
    setDate(
      range?.from
        ? {
            from: startOfDay(range.from),
            to: range.to ? startOfDay(range.to) : undefined,
          }
        : undefined
    )
    if (range?.from && range?.to) {
      navigate(range.from, range.to)
      setOpen(false)
    }
  }

  function handlePreset(days: number) {
    const to = startOfDay(new Date())
    const from = startOfDay(subDays(to, days - 1))
    setDate({ from, to })
    navigate(from, to)
    setOpen(false)
  }

  function handleClear() {
    setDate(undefined)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("from")
    params.delete("to")
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-normal",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-[#9CA3AF]" />
        {date?.from ? (
          date.to ? (
            <span className="text-sm text-[#111827]">
              {format(date.from, "dd/MM/yy", { locale: ptBR })} — 
              {format(date.to, "dd/MM/yy", { locale: ptBR })}
            </span>
          ) : (
            <span className="text-sm text-[#111827]">
              {format(date.from, "dd/MM/yy", { locale: ptBR })}
            </span>
          )
        ) : (
          <span className="text-sm text-[#9CA3AF]">Selecionar periodo</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="border-b border-[#E5E7EB] p-3 sm:border-b-0 sm:border-r">
            <div className="flex gap-2 sm:flex-col sm:gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => handlePreset(preset.days)}
                  className="rounded-md px-3 py-1.5 text-left text-sm text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                >
                  {preset.label}
                </button>
              ))}
              {date && (
                <button
                  onClick={handleClear}
                  className="rounded-md px-3 py-1.5 text-left text-sm text-[#B2121A] transition-colors hover:bg-red-50"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={ptBR}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

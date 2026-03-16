"use client"

import { useRef, useState } from "react"
import { Info } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DisclaimerSection {
  label: string
  content: string
}

interface BusinessDisclaimerProps {
  title: string
  description?: string
  sections: DisclaimerSection[]
  className?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

export function BusinessDisclaimer({
  title,
  description,
  sections,
  className,
  side = "bottom",
  align = "end",
}: BusinessDisclaimerProps) {
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)

  function clearCloseTimeout() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  function handleOpen() {
    clearCloseTimeout()
    setOpen(true)
  }

  function handleClose() {
    clearCloseTimeout()
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false)
    }, 120)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Explicar: ${title}`}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            onFocus={handleOpen}
            onBlur={handleClose}
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D6DCE5] bg-[#FCFCFB] text-[#6B7280] transition-colors hover:border-[#B2121A]/30 hover:text-[#B2121A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B2121A]/25",
              className
            )}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        }
      />
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-[23rem] rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <PopoverHeader className="gap-1.5">
          <PopoverTitle className="text-sm font-semibold text-[#111827]">
            {title}
          </PopoverTitle>
          {description ? (
            <PopoverDescription className="text-xs leading-5 text-[#6B7280]">
              {description}
            </PopoverDescription>
          ) : null}
        </PopoverHeader>

        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.label} className="rounded-xl bg-[#F8FAFC] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
                {section.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#475569]">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

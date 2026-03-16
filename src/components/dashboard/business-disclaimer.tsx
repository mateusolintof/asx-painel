"use client"

import {
  type FocusEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { Info } from "lucide-react"
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

interface Position {
  top: number
  left: number
}

const PANEL_WIDTH = 368
const PANEL_GAP = 8
const VIEWPORT_GAP = 12
const CLOSE_DELAY_MS = 140

export function BusinessDisclaimer({
  title,
  description,
  sections,
  className,
  side = "bottom",
  align = "end",
}: BusinessDisclaimerProps) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [prefersHover, setPrefersHover] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current

    if (!trigger) return

    const triggerRect = trigger.getBoundingClientRect()
    const panelHeight = panel?.offsetHeight ?? 220
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let left = triggerRect.right - PANEL_WIDTH
    if (align === "start") {
      left = triggerRect.left
    }
    if (align === "center") {
      left = triggerRect.left + triggerRect.width / 2 - PANEL_WIDTH / 2
    }

    let top = triggerRect.bottom + PANEL_GAP
    if (side === "top") {
      top = triggerRect.top - panelHeight - PANEL_GAP
    }
    if (side === "right") {
      left = triggerRect.right + PANEL_GAP
      top = triggerRect.top + triggerRect.height / 2 - panelHeight / 2
    }
    if (side === "left") {
      left = triggerRect.left - PANEL_WIDTH - PANEL_GAP
      top = triggerRect.top + triggerRect.height / 2 - panelHeight / 2
    }

    left = Math.max(VIEWPORT_GAP, Math.min(left, viewportWidth - PANEL_WIDTH - VIEWPORT_GAP))
    top = Math.max(VIEWPORT_GAP, Math.min(top, viewportHeight - panelHeight - VIEWPORT_GAP))

    setPosition({ top, left })
  }, [align, side])

  const handleOpen = useCallback(() => {
    clearCloseTimeout()
    setOpen(true)
  }, [clearCloseTimeout])

  const handleClose = useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false)
    }, CLOSE_DELAY_MS)
  }, [clearCloseTimeout])

  useEffect(() => {
    setMounted(true)

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const syncPointerMode = () => setPrefersHover(mediaQuery.matches)
    syncPointerMode()
    mediaQuery.addEventListener("change", syncPointerMode)

    return () => {
      clearCloseTimeout()
      mediaQuery.removeEventListener("change", syncPointerMode)
    }
  }, [clearCloseTimeout])

  useLayoutEffect(() => {
    if (!open) return

    updatePosition()
    const handler = () => updatePosition()

    window.addEventListener("resize", handler)
    window.addEventListener("scroll", handler, true)

    return () => {
      window.removeEventListener("resize", handler)
      window.removeEventListener("scroll", handler, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null
      if (!target) return

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }

      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  function handleTriggerClick() {
    if (prefersHover) return
    clearCloseTimeout()
    setOpen((current) => !current)
  }

  function handleTriggerPointerEnter() {
    if (!prefersHover) return
    handleOpen()
  }

  function handleTriggerPointerLeave() {
    if (!prefersHover) return
    handleClose()
  }

  function handleTriggerFocus() {
    handleOpen()
  }

  function handleTriggerBlur(event: FocusEvent<HTMLButtonElement>) {
    const nextFocused = event.relatedTarget as Node | null
    if (nextFocused && panelRef.current?.contains(nextFocused)) return
    if (!prefersHover) {
      handleClose()
      return
    }
    handleClose()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-controls={open ? panelId : undefined}
        aria-label={`Explicar: ${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleTriggerClick}
        onPointerEnter={handleTriggerPointerEnter}
        onPointerLeave={handleTriggerPointerLeave}
        onFocus={handleTriggerFocus}
        onBlur={handleTriggerBlur}
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D6DCE5] bg-[#FCFCFB] text-[#6B7280] transition-colors hover:border-[#B2121A]/30 hover:text-[#B2121A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B2121A]/25",
          className
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {mounted && open
        ? createPortal(
            <div
              id={panelId}
              ref={panelRef}
              role="dialog"
              aria-label={title}
              tabIndex={-1}
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              className="fixed z-[80] w-[min(23rem,calc(100vw-1.5rem))] rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
              style={{
                top: position.top,
                left: position.left,
              }}
            >
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#111827]">{title}</p>
                {description ? (
                  <p className="text-xs leading-5 text-[#6B7280]">{description}</p>
                ) : null}
              </div>

              <div className="mt-3 space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.label}
                    className="rounded-xl bg-[#F8FAFC] px-3 py-2.5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
                      {section.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#475569]">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

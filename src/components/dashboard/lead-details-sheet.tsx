"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowUpRight, XIcon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LeadDetailsSheetProps {
  leadId: string
  title: string
  subtitle?: string
  badges?: ReactNode
  children: ReactNode
}

export function LeadDetailsSheet({
  leadId,
  title,
  subtitle,
  badges,
  children,
}: LeadDetailsSheetProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function closeSheet() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("leadId")
    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && closeSheet()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[#0F172A]/32 duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-[3px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        <DialogPrimitive.Popup
          className="fixed inset-0 z-50 flex items-center justify-center p-0 text-sm text-[#111827] duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.985] data-closed:animate-out data-closed:fade-out-0 sm:p-6"
        >
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#F5F3EE] sm:h-[min(92vh,920px)] sm:max-w-[1120px] sm:rounded-[30px] sm:border sm:border-[#DDD7CC] sm:bg-[#F7F5F0] sm:shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-3 top-3 z-20 rounded-xl border border-[#DDD7CC] bg-[#FCFBF8]/90 text-[#475569] shadow-none hover:bg-white sm:right-4 sm:top-4"
                />
              }
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Fechar detalhes do lead</span>
            </DialogPrimitive.Close>

            <div className="border-b border-[#DDD7CC] bg-[linear-gradient(180deg,#FFFCF8_0%,#F7F4EE_100%)] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 pr-12 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                      Leitura operacional do lead
                    </p>
                    <DialogPrimitive.Title className="truncate text-xl font-semibold tracking-tight text-[#111827] sm:text-2xl">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="max-w-2xl text-sm text-[#6B7280]">
                      {subtitle ?? "Detalhes operacionais do lead selecionado."}
                    </DialogPrimitive.Description>
                  </div>

                  {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href={`/leads/${leadId}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-10 rounded-xl border-[#D9D2C7] bg-[#FCFBF8] px-3.5 text-[#475569] hover:bg-white"
                    )}
                  >
                    Abrir pagina
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="mx-auto w-full max-w-[1040px]">{children}</div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

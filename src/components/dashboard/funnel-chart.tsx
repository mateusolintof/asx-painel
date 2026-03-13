"use client"

import { ArrowDownRight } from "lucide-react"
import type { FunnelStage } from "@/lib/queries/funnel"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface FunnelChartProps {
  data: FunnelStage[]
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "")
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized

  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280]">
        Sem dados para o período selecionado
      </div>
    )
  }

  const maxCount = data[0]?.count ?? 0

  return (
    <div className="space-y-3">
      {data.map((stage, index) => {
        const previous = data[index - 1]
        const relativeWidth =
          maxCount > 0 ? Math.round((stage.count / maxCount) * 1000) / 10 : 0
        const width = stage.count > 0 ? Math.max(relativeWidth, 14) : 0
        const fitsInside = width >= 42
        const lostLeads = previous ? Math.max(previous.count - stage.count, 0) : 0

        return (
          <div key={stage.stage} className="space-y-2">
            {previous ? (
              <div className="flex items-center gap-2 pl-1 text-[11px] text-[#6B7280]">
                <span className="h-4 w-px bg-[#E5E7EB]" />
                <ArrowDownRight className="h-3.5 w-3.5 text-[#9CA3AF]" />
                <span>
                  queda de {formatNumber(lostLeads)} lead
                  {lostLeads !== 1 ? "s" : ""} entre etapas
                </span>
              </div>
            ) : null}

            <div className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white/70 p-3 md:grid-cols-[196px_minmax(0,1fr)_132px] md:items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#111827]">{stage.stage}</p>
                <p className="text-xs text-[#6B7280]">
                  {formatPercent(stage.percentage)} do total
                </p>
              </div>

              <div className="relative h-12 overflow-hidden rounded-2xl bg-[#F3F4F6]">
                <div
                  className="absolute inset-y-0 left-0 rounded-2xl"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${withAlpha(stage.color, 0.96)} 0%, ${withAlpha(stage.color, 0.7)} 100%)`,
                    boxShadow: `inset 0 0 0 1px ${withAlpha(stage.color, 0.16)}`,
                  }}
                />
                <div className="relative flex h-full items-center justify-between gap-2 px-3">
                  <span
                    className={`text-sm font-semibold ${
                      fitsInside ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    {formatNumber(stage.count)}
                  </span>
                  {fitsInside ? (
                    <span className="rounded-full bg-white/16 px-2 py-0.5 text-[11px] font-medium text-white">
                      {formatPercent(stage.fromPreviousRate ?? stage.percentage)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 md:block md:text-right">
                <div className="text-lg font-semibold tracking-tight text-[#111827]">
                  {formatNumber(stage.count)}
                </div>
                <div className="mt-1 inline-flex rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#475569] ring-1 ring-inset ring-[#E5E7EB]">
                  {index === 0
                    ? "base do fluxo"
                    : `${formatPercent(stage.fromPreviousRate ?? 0)} da etapa anterior`}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

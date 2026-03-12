import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatNumber, formatPercent, formatCurrency, calcDelta } from "@/lib/utils/format"

interface KPICardProps {
  label: string
  value: number
  previousValue?: number
  format?: "number" | "percent" | "currency"
  accentColor?: string
}

export function KPICard({
  label,
  value,
  previousValue,
  format = "number",
  accentColor = "#B2121A",
}: KPICardProps) {
  const formatted =
    format === "percent"
      ? formatPercent(value)
      : format === "currency"
        ? formatCurrency(value)
        : formatNumber(value)

  const delta =
    previousValue !== undefined ? calcDelta(value, previousValue) : null

  const deltaFormatted = delta !== null ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%` : null

  return (
    <Card
      className="relative overflow-hidden border border-[#E5E7EB] bg-white p-4"
      style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{label}</p>
          <p className="mt-1 text-[2rem] font-semibold tracking-tight text-[#111827]">
            {formatted}
          </p>
        </div>

        {delta !== null && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
              delta > 0 && "bg-emerald-50 text-emerald-700",
              delta < 0 && "bg-red-50 text-red-700",
              delta === 0 && "bg-gray-50 text-gray-600"
            )}
          >
            {delta > 0 && <TrendingUp className="h-3 w-3" />}
            {delta < 0 && <TrendingDown className="h-3 w-3" />}
            {delta === 0 && <Minus className="h-3 w-3" />}
            {deltaFormatted}
          </div>
        )}
      </div>
    </Card>
  )
}

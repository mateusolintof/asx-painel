import { endOfDay, startOfDay } from "date-fns"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ComparisonChart } from "@/components/dashboard/comparison-chart"
import { comparePeriods } from "@/lib/queries/comparisons"
import { formatNumber, formatPercent } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  searchParams: Promise<{ preset?: string }>
}

function getPresetPeriods(preset: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (preset === "month") {
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    return {
      periodA: {
        from: startOfDay(thisMonthStart).toISOString(),
        to: now.toISOString(),
      },
      periodB: {
        from: startOfDay(lastMonthStart).toISOString(),
        to: endOfDay(lastMonthEnd).toISOString(),
      },
      labelA: "Este mês",
      labelB: "Mês passado",
    }
  }

  // Default: week
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - today.getDay())
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)

  return {
    periodA: {
      from: startOfDay(thisWeekStart).toISOString(),
      to: now.toISOString(),
    },
    periodB: {
      from: startOfDay(lastWeekStart).toISOString(),
      to: endOfDay(lastWeekEnd).toISOString(),
    },
    labelA: "Esta semana",
    labelB: "Semana passada",
  }
}

export default async function ComparativosPage({ searchParams }: Props) {
  const params = await searchParams
  const preset = params.preset ?? "week"
  const { periodA, periodB, labelA, labelB } = getPresetPeriods(preset)

  const metrics = await comparePeriods(periodA, periodB)

  return (
    <div className="space-y-8">
      {/* Preset Tabs */}
      <div className="flex gap-2">
        {[
          { key: "week", label: "Semana" },
          { key: "month", label: "Mês" },
        ].map((p) => (
          <Link
            key={p.key}
            href={`?preset=${p.key}`}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              preset === p.key
                ? "bg-[#B2121A] text-white"
                : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6]"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-[#6B7280]">
        Comparando <span className="font-medium text-[#111827]">{labelA}</span> vs{" "}
        <span className="font-medium text-[#111827]">{labelB}</span>
      </p>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border bg-white p-5">
            <p className="text-sm text-[#6B7280]">{metric.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold text-[#111827]">
                  {metric.format === "percent"
                    ? formatPercent(metric.periodA)
                    : formatNumber(metric.periodA)}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  vs{" "}
                  {metric.format === "percent"
                    ? formatPercent(metric.periodB)
                    : formatNumber(metric.periodB)}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                  metric.delta > 0 && "bg-emerald-50 text-emerald-700",
                  metric.delta < 0 && "bg-red-50 text-red-700",
                  metric.delta === 0 && "bg-gray-50 text-gray-600"
                )}
              >
                {metric.delta > 0 && <TrendingUp className="h-3 w-3" />}
                {metric.delta < 0 && <TrendingDown className="h-3 w-3" />}
                {metric.delta === 0 && <Minus className="h-3 w-3" />}
                {metric.delta > 0 ? "+" : ""}
                {metric.delta.toFixed(1)}%
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border bg-white p-6">
        <h2 className="mb-4 text-base font-medium text-[#111827]">
          Comparação Visual
        </h2>
        <ComparisonChart data={metrics} />
      </Card>
    </div>
  )
}

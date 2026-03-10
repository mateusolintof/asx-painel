import { Card } from "@/components/ui/card"
import { KPICard } from "@/components/dashboard/kpi-card"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { TrendLine } from "@/components/dashboard/trend-line"
import { PathPieChart } from "@/components/dashboard/path-pie-chart"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { getKPIs, getTrendData, getPathDistribution } from "@/lib/queries/overview"
import { getFunnelData } from "@/lib/queries/funnel"

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>
}

function getDateRange(daysAgo: number, length: number) {
  const to = new Date()
  to.setDate(to.getDate() - daysAgo)
  const from = new Date(to)
  from.setDate(from.getDate() - length)
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

export default async function OverviewPage({ searchParams }: Props) {
  const params = await searchParams
  const hasCustomRange = params.from && params.to

  const current = hasCustomRange
    ? { from: params.from!, to: params.to! }
    : getDateRange(0, 30)

  const daysInRange = hasCustomRange
    ? Math.ceil((new Date(params.to!).getTime() - new Date(params.from!).getTime()) / 86400000)
    : 30

  const previous = hasCustomRange
    ? {
        from: new Date(new Date(params.from!).getTime() - daysInRange * 86400000).toISOString(),
        to: params.from!,
      }
    : getDateRange(30, 30)

  const [kpis, trend, funnel, pathDist] = await Promise.all([
    getKPIs(current, previous),
    getTrendData(current),
    getFunnelData(current),
    getPathDistribution(current),
  ])

  const KPI_COLORS = ["#B2121A", "#059669", "#2563EB", "#D97706"]

  return (
    <div className="space-y-8">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">
          {hasCustomRange ? "Periodo personalizado" : "Ultimos 30 dias"}
        </p>
        <DateRangePicker />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            previousValue={kpi.previousValue}
            format={kpi.format}
            accentColor={KPI_COLORS[i]}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 border bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-medium text-[#111827]">
            Leads nos últimos {daysInRange} dias
          </h2>
          <TrendLine data={trend} />
        </Card>

        <Card className="border bg-white p-6">
          <h2 className="mb-4 text-base font-medium text-[#111827]">
            Distribuição por Path
          </h2>
          <PathPieChart data={pathDist} />
        </Card>
      </div>

      {/* Funnel */}
      <Card className="border bg-white p-6">
        <h2 className="mb-4 text-base font-medium text-[#111827]">
          Funil de Conversão
        </h2>
        <FunnelChart data={funnel} />
      </Card>
    </div>
  )
}

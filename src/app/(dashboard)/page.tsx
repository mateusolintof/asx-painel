import { endOfDay, startOfDay, subDays } from "date-fns"
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
  const to = endOfDay(subDays(new Date(), daysAgo))
  const from = startOfDay(subDays(to, length - 1))
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
    ? (() => {
        const currentFrom = new Date(params.from!)
        const previousTo = new Date(currentFrom.getTime() - 1)
        const previousFrom = startOfDay(subDays(previousTo, daysInRange - 1))

        return {
          from: previousFrom.toISOString(),
          to: endOfDay(previousTo).toISOString(),
        }
      })()
    : getDateRange(30, 30)

  const [kpis, trend, funnel, pathDist] = await Promise.all([
    getKPIs(current, previous),
    getTrendData(current),
    getFunnelData(current),
    getPathDistribution(current),
  ])

  const KPI_COLORS = ["#B2121A", "#059669", "#2563EB", "#D97706"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">
            {hasCustomRange ? "Periodo personalizado" : "Ultimos 30 dias"}
          </p>
          <p className="mt-1 max-w-3xl text-sm text-[#94A3B8]">
            Leitura compacta para acompanhar entrada, qualificação e avanço
            comercial sem perder área útil do dashboard.
          </p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(400px,1fr)]">
        <Card className="col-span-1 min-w-0 border border-[#E5E7EB] bg-white px-4 md:px-5">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#111827]">
              Leads nos ultimos {daysInRange} dias
            </h2>
            <p className="text-sm text-[#6B7280]">
              Comparacao entre volume total e qualificados Path 3 ao longo do
              periodo.
            </p>
          </div>
          <TrendLine data={trend} />
        </Card>

        <Card className="min-w-0 border border-[#E5E7EB] bg-white px-4 md:px-5">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#111827]">
              Distribuicao por Path
            </h2>
            <p className="text-sm text-[#6B7280]">
              Como a entrada atual se divide entre desqualificacao, distribuicao
              e qualificacao.
            </p>
          </div>
          <PathPieChart data={pathDist} />
        </Card>
      </div>

      <Card className="min-w-0 border border-[#E5E7EB] bg-white px-4 md:px-5">
        <div className="space-y-1">
          <h2 className="text-base font-medium text-[#111827]">
            Funil Principal (Path 3)
          </h2>
          <p className="text-sm text-[#6B7280]">
            Queda entre etapas do pipeline que realmente avanca para handoff.
          </p>
        </div>
        <FunnelChart data={funnel.chart} />
      </Card>
    </div>
  )
}

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
            Visao rapida do volume recebido, do que avancou para o time interno
            e da passagem para os vendedores.
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

      <Card className="col-span-1 min-w-0 border border-[#E5E7EB] bg-white px-4 md:px-5">
        <div className="space-y-1">
          <h2 className="text-base font-medium text-[#111827]">
            Leads nos ultimos {daysInRange} dias
          </h2>
          <p className="text-sm text-[#6B7280]">
            Volume recebido por dia comparado ao que permaneceu com o time
            comercial da ASX.
          </p>
        </div>
        <TrendLine data={trend} />
      </Card>

      <Card className="min-w-0 border border-[#E5E7EB] bg-white px-4 md:px-5">
        <div className="space-y-1">
          <h2 className="text-base font-medium text-[#111827]">
            Destino apos a triagem
          </h2>
          <p className="text-sm text-[#6B7280]">
            Como os contatos recebidos se dividiram entre descarte, parceiros e
            atendimento interno.
          </p>
        </div>
        <PathPieChart data={pathDist} />
      </Card>

      <Card className="min-w-0 border border-[#E5E7EB] bg-white px-4 md:px-5">
        <div className="space-y-1">
          <h2 className="text-base font-medium text-[#111827]">
            Funil comercial
          </h2>
          <p className="text-sm text-[#6B7280]">
            Evolucao das oportunidades que ficam no time interno ate chegarem
            ao vendedor.
          </p>
        </div>
        <FunnelChart data={funnel.chart} />
      </Card>
    </div>
  )
}

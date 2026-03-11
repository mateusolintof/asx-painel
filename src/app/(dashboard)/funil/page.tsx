import { Card } from "@/components/ui/card"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { getFunnelData } from "@/lib/queries/funnel"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function FunilPage({ searchParams }: Props) {
  const params = await searchParams
  const period =
    params.from && params.to
      ? { from: params.from, to: params.to }
      : undefined

  const funnel = await getFunnelData(period)

  return (
    <div className="space-y-8">
      {/* Date Filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">
          {period ? "Periodo personalizado" : "Todos os leads"}
        </p>
        <DateRangePicker />
      </div>

      {/* Summary Cards */}
      {funnel.summary.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {funnel.summary.map((stage) => (
            <Card key={stage.stage} className="border bg-white p-4">
              <p className="text-xs text-[#6B7280]">{stage.stage}</p>
              <p className="mt-1 text-2xl font-semibold text-[#111827]">
                {formatNumber(stage.count)}
              </p>
              <p className="text-xs text-[#9CA3AF]">{formatPercent(stage.percentage)}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Funnel Chart */}
      <Card className="border bg-white p-6">
        <h2 className="mb-4 text-base font-medium text-[#111827]">
          Funil Principal (Path 3)
        </h2>
        <p className="mb-4 text-sm text-[#6B7280]">
          O Path 2 aparece nos cards acima como desvio operacional, mas fica
          fora do funil principal porque nao segue para qualificacao e handoff.
        </p>
        <FunnelChart data={funnel.chart} />
      </Card>

      {/* Conversion Rates */}
      {funnel.conversions.length > 0 && (
        <Card className="border bg-white p-6">
          <h2 className="mb-4 text-base font-medium text-[#111827]">
            Taxas de Conversão
          </h2>
          <div className="space-y-3">
            {funnel.conversions.map((step) => {
              return (
                <div key={step.label} className="flex items-center gap-4">
                  <span className="w-40 shrink-0 text-sm text-[#6B7280]">
                    {step.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(step.rate, 100)}%`,
                          backgroundColor: step.color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-[#111827]">
                    {formatPercent(step.rate)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

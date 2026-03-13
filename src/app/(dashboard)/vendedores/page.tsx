import { UserCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getSellerPerformance } from "@/lib/queries/sellers"
import { SCORE_COLORS, SCORE_LABELS } from "@/lib/utils/constants"
import {
  formatNumber,
  formatPhone,
  formatRelativeTime,
} from "@/lib/utils/format"

export default async function VendedoresPage() {
  const sellers = await getSellerPerformance()
  const totalAssigned = sellers.reduce((sum, seller) => sum + seller.totalLeads, 0)
  const avgScoreBase = sellers.filter((seller) => seller.totalLeads > 0)
  const avgScore =
    avgScoreBase.length > 0
      ? Math.round(
          avgScoreBase.reduce((sum, seller) => sum + seller.avgScore, 0) /
            avgScoreBase.length
        )
      : 0
  const hottestLeads = sellers.reduce((sum, seller) => {
    const hotClass = seller.scoreDistribution.find((item) => item.class === "quente")
    return sum + (hotClass?.count ?? 0)
  }, 0)
  const topSeller = [...sellers].sort((a, b) => b.totalLeads - a.totalLeads)[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Vendedores ativos" value={formatNumber(sellers.length)} />
        <SummaryCard
          label="Leads distribuidos"
          value={formatNumber(totalAssigned)}
          accent="#D97706"
        />
        <SummaryCard
          label="Leads quentes em carteira"
          value={formatNumber(hottestLeads)}
          accent="#059669"
          helper={`pontuacao media geral ${formatNumber(avgScore)}`}
        />
        <SummaryCard
          label="Carteira lider"
          value={formatNumber(topSeller?.totalLeads ?? 0)}
          accent="#2563EB"
          helper={
            topSeller
              ? `${topSeller.name} concentra a maior carteira atual`
              : "Ainda nao existe carteira com volume relevante"
          }
        />
      </div>

      {sellers.length === 0 ? (
        <Card className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-8">
          <p className="text-center text-sm text-[#6B7280]">
            Nenhum vendedor encontrado.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sellers.map((seller) => {
            const topScore = [...seller.scoreDistribution].sort(
              (a, b) => b.count - a.count
            )[0]
            const maxScoreCount = Math.max(
              ...seller.scoreDistribution.map((item) => item.count),
              0
            )

            return (
              <Card
                key={seller.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 md:px-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#B2121A]/10 text-[#B2121A]">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-[#111827]">
                        {seller.name}
                      </h2>
                      <p className="text-sm text-[#6B7280]">
                        {formatPhone(seller.phone)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-1.5 text-xs font-medium text-[#6B7280]">
                    {seller.latestAssignment
                      ? `Ultimo lead ${formatRelativeTime(seller.latestAssignment)}`
                      : "Sem atribuicoes recentes"}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCell
                    label="Leads na carteira"
                    value={formatNumber(seller.totalLeads)}
                  />
                  <MetricCell
                    label="Pontuacao media"
                    value={formatNumber(seller.avgScore)}
                  />
                  <MetricCell
                    label="Classe dominante"
                    value={
                      topScore && topScore.count > 0
                        ? SCORE_LABELS[topScore.class]
                        : "Sem classificacao"
                    }
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        Distribuicao por temperatura
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Como a carteira atual se distribui entre quente, morno e
                        frio.
                      </p>
                    </div>
                    <div className="text-xs font-medium text-[#6B7280]">
                      {formatNumber(seller.totalLeads)} leads
                    </div>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#ECEFF3]">
                    {seller.totalLeads > 0 ? (
                      seller.scoreDistribution.map((item) => {
                        const width =
                          seller.totalLeads > 0
                            ? (item.count / seller.totalLeads) * 100
                            : 0
                        if (width === 0) return null

                        const fillMap: Record<string, string> = {
                          quente: "#B2121A",
                          morno: "#D97706",
                          frio: "#2563EB",
                        }

                        return (
                          <div
                            key={item.class}
                            className="h-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: fillMap[item.class] ?? "#6B7280",
                            }}
                          />
                        )
                      })
                    ) : (
                      <div className="h-full w-full bg-[#E5E7EB]" />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {seller.scoreDistribution.map((item) => (
                      <Badge
                        key={item.class}
                        variant="outline"
                        className={SCORE_COLORS[item.class]}
                      >
                        {SCORE_LABELS[item.class]}: {item.count}
                      </Badge>
                    ))}
                  </div>

                  {maxScoreCount === 0 ? (
                    <p className="mt-3 text-xs text-[#8A94A6]">
                      Ainda nao existem leads classificados nessa carteira.
                    </p>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  helper,
  accent = "#B2121A",
}: {
  label: string
  value: string
  helper?: string
  accent?: string
}) {
  return (
    <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="h-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <p className="mt-3 text-sm text-[#6B7280]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8A94A6]">
        {helper ?? "leitura atual da carteira"}
      </p>
    </Card>
  )
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A94A6]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
    </div>
  )
}

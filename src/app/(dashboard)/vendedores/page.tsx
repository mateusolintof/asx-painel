import { UserCheck } from "lucide-react"
import { BusinessDisclaimer } from "@/components/dashboard/business-disclaimer"
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
        <SummaryCard
          label="Vendedores ativos"
          value={formatNumber(sellers.length)}
          disclaimer={{
            title: "Vendedores ativos",
            description: "Quantidade de vendedores cadastrados e exibidos nesta visão.",
            sections: [
              {
                label: "O que entra na conta",
                content:
                  "Os vendedores cadastrados na base e reconhecidos pelo painel como responsáveis por carteira.",
              },
              {
                label: "Na prática",
                content:
                  "Serve como referência da capacidade comercial disponível para absorver e trabalhar os handoffs.",
              },
            ],
          }}
        />
        <SummaryCard
          label="Leads repassados"
          value={formatNumber(totalAssigned)}
          accent="#D97706"
          disclaimer={{
            title: "Leads distribuídos",
            description: "Total de oportunidades já repassadas aos vendedores.",
            sections: [
              {
                label: "O que entra na conta",
                content:
                  "Cada lead que já recebeu uma atribuição formal para algum vendedor.",
              },
              {
                label: "Na prática",
                content:
                  "Mostra o tamanho da carteira já colocada na mão do time comercial.",
              },
            ],
          }}
        />
        <SummaryCard
          label="Oportunidades quentes"
          value={formatNumber(hottestLeads)}
          accent="#059669"
          helper={`pontuacao media geral ${formatNumber(avgScore)}`}
          disclaimer={{
            title: "Leads quentes em carteira",
            description: "Volume de oportunidades com maior prioridade comercial.",
            sections: [
              {
                label: "O que entra na conta",
                content:
                  "Leads atribuídos aos vendedores cuja classificação de score é 'quente'.",
              },
              {
                label: "Na prática",
                content:
                  "Esse número mostra o tamanho da carteira mais sensível e com maior potencial de fechamento.",
              },
            ],
          }}
        />
        <SummaryCard
          label="Maior carteira"
          value={formatNumber(topSeller?.totalLeads ?? 0)}
          accent="#2563EB"
          helper={
            topSeller
              ? `${topSeller.name} concentra a maior carteira atual`
              : "Ainda nao existe carteira com volume relevante"
          }
          disclaimer={{
            title: "Carteira líder",
            description: "Maior carteira entre os vendedores ativos.",
            sections: [
              {
                label: "O que entra na conta",
                content:
                  "O painel identifica qual vendedor recebeu mais leads no histórico de atribuições.",
              },
              {
                label: "Na prática",
                content:
                  "Ajuda a enxergar concentração de carteira e eventual desequilíbrio de distribuição entre vendedores.",
              },
            ],
          }}
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
                    label="Temperatura predominante"
                    value={
                      topScore && topScore.count > 0
                        ? SCORE_LABELS[topScore.class]
                        : "Sem classificacao"
                    }
                    disclaimer={{
                      title: "Temperatura predominante",
                      description: "Faixa de qualidade mais frequente na carteira do vendedor.",
                      sections: [
                        {
                          label: "Como é calculada",
                          content:
                            "O painel compara quantos leads quentes, mornos e frios existem na carteira desse vendedor e destaca a faixa com maior volume.",
                        },
                        {
                          label: "Na prática",
                          content:
                            "Mostra o perfil comercial mais comum da carteira atual. Exemplo: se predomina 'morno', o vendedor está operando mais oportunidades de desenvolvimento do que urgências imediatas.",
                        },
                      ],
                    }}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#111827]">
                        Qualidade da carteira
                        </p>
                        <BusinessDisclaimer
                          title="Qualidade da carteira"
                          description="Composicao da carteira do vendedor por nivel de qualidade do lead."
                          sections={[
                            {
                              label: "O que entra na conta",
                              content:
                                "A distribuição usa os scores dos leads já atribuídos ao vendedor e separa entre quente, morno e frio.",
                            },
                            {
                              label: "Na prática",
                              content:
                                "Ajuda a avaliar se a carteira está mais pesada em urgências, em oportunidades para nutrir ou em leads com menor probabilidade de avanço.",
                            },
                          ]}
                          side="left"
                        />
                      </div>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Como a carteira atual se divide entre oportunidades
                        quentes, mornas e frias.
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
  disclaimer,
}: {
  label: string
  value: string
  helper?: string
  accent?: string
  disclaimer?: {
    title: string
    description?: string
    sections: { label: string; content: string }[]
  }
}) {
  return (
    <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="h-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <div className="mt-3 flex items-center gap-2">
        <p className="text-sm text-[#6B7280]">{label}</p>
        {disclaimer ? <BusinessDisclaimer {...disclaimer} /> : null}
      </div>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8A94A6]">
        {helper ?? "leitura atual da carteira"}
      </p>
    </Card>
  )
}

function MetricCell({
  label,
  value,
  disclaimer,
}: {
  label: string
  value: string
  disclaimer?: {
    title: string
    description?: string
    sections: { label: string; content: string }[]
  }
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-3">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A94A6]">
          {label}
        </p>
        {disclaimer ? (
          <BusinessDisclaimer
            {...disclaimer}
            side="bottom"
            align="start"
            className="h-6 w-6"
          />
        ) : null}
      </div>
      <p className="mt-1 text-xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
    </div>
  )
}

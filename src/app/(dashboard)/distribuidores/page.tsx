import type { ReactNode } from "react"
import Link from "next/link"
import { Building2, MapPinned, Route, Sparkles } from "lucide-react"
import { StateFilter } from "@/components/dashboard/state-filter"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getDistributorStats } from "@/lib/queries/distributors"
import { cn } from "@/lib/utils"
import {
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "@/lib/utils/format"

interface Props {
  searchParams: Promise<{ estado?: string }>
}

export default async function DistribuidoresPage({ searchParams }: Props) {
  const params = await searchParams
  const data = await getDistributorStats(params.estado)
  const totalVisibleRecommendations = data.distributors.reduce(
    (sum, distributor) => sum + distributor.timesRecommended,
    0
  )
  const coveredStates = new Set(
    data.distributors.map((distributor) => distributor.estado_uf)
  ).size
  const topDistributor = data.distributors[0] ?? null
  const topState = Object.entries(
    data.distributors.reduce<Record<string, number>>((acc, distributor) => {
      acc[distributor.estado_uf] =
        (acc[distributor.estado_uf] ?? 0) + distributor.timesRecommended
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Path 2 encaminhados"
          value={formatNumber(data.totalRedirections)}
          helper="Leads desviados para distribuidores no historico visivel."
          accent="#D97706"
          icon={<Route className="h-4 w-4 text-[#D97706]" />}
        />
        <SummaryCard
          label={params.estado ? `Carga em ${params.estado}` : "Carga exibida"}
          value={formatNumber(totalVisibleRecommendations)}
          helper={
            params.estado
              ? "Recomendacoes concentradas no filtro atual."
              : "Volume da tabela atual para leitura de cobertura."
          }
          accent="#2563EB"
          icon={<Sparkles className="h-4 w-4 text-[#2563EB]" />}
        />
        <SummaryCard
          label="Distribuidor lider"
          value={
            topDistributor
              ? formatNumber(topDistributor.timesRecommended)
              : formatNumber(0)
          }
          helper={
            topDistributor
              ? `${topDistributor.razao_social} - ${topDistributor.cidade}/${topDistributor.estado_uf}`
              : "Nenhum distribuidor recomendado ainda."
          }
          accent="#059669"
          icon={<Building2 className="h-4 w-4 text-[#059669]" />}
        />
        <SummaryCard
          label="Cobertura ativa"
          value={formatNumber(coveredStates || data.availableStates.length)}
          helper={
            topState
              ? `${topState[0]} concentra ${formatNumber(topState[1])} recomendacoes.`
              : "Rede sem recorrencia de recomendacoes."
          }
          accent="#B2121A"
          icon={<MapPinned className="h-4 w-4 text-[#B2121A]" />}
        />
      </div>

      <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                Rede recomendada
              </p>
              {params.estado ? (
                <Badge
                  variant="outline"
                  className="border-[#D6DCE5] bg-[#FCFCFB] text-[#475569]"
                >
                  Filtrando {params.estado}
                </Badge>
              ) : null}
            </div>
            <div>
              <h2 className="text-base font-medium text-[#111827]">
                Distribuidores mais acionados pela operacao
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-[#6B7280]">
                A tabela destaca frequencia de recomendacao, cobertura regional e
                recencia para facilitar ajuste de estoque, rota e handoff de Path
                2.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <StateFilter
              currentState={params.estado}
              states={data.availableStates}
            />
            {params.estado ? (
              <Link
                href="/distribuidores"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F5F7FA]"
              >
                Limpar filtro
              </Link>
            ) : null}
          </div>
        </div>

        {data.distributors.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#D6DCE5] bg-[#FCFCFB] text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B2121A]/8 text-[#B2121A]">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#111827]">
                Nenhuma recomendacao registrada
              </p>
              <p className="max-w-sm text-sm text-[#6B7280]">
                Quando a operacao recomendar distribuidores, a concentracao por
                praca e a recorrencia aparecerao aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E5E7EB]">
            <table className="min-w-[980px] table-fixed border-collapse">
              <thead className="bg-[#FAFBFC]">
                <tr className="border-b border-[#E5E7EB]">
                  <th className="w-16 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                    Rank
                  </th>
                  <th className="w-[31%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                    Distribuidor
                  </th>
                  <th className="w-[18%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                    Praca
                  </th>
                  <th className="w-[16%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                    Tipo
                  </th>
                  <th className="w-[21%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                    Peso operacional
                  </th>
                  <th className="w-[14%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                    Ultima recomendacao
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.distributors.map((distributor, index) => {
                  const shareOfVisible =
                    totalVisibleRecommendations > 0
                      ? (distributor.timesRecommended /
                          totalVisibleRecommendations) *
                        100
                      : 0
                  const relativeToLeader =
                    topDistributor && topDistributor.timesRecommended > 0
                      ? (distributor.timesRecommended /
                          topDistributor.timesRecommended) *
                        100
                      : 0

                  return (
                    <tr
                      key={distributor.id}
                      className="border-b border-[#EEF1F5] align-top transition-colors last:border-b-0 hover:bg-[#FCFCFD]"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] text-sm font-semibold text-[#111827]">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#111827]">
                              {distributor.razao_social}
                            </p>
                            {index === 0 ? (
                              <Badge className="bg-[#B2121A]/10 text-[#B2121A] hover:bg-[#B2121A]/10">
                                Lider
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-[#8A94A6]">
                            {shareOfVisible.toFixed(1)}% da carga visivel de
                            recomendacoes
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#111827]">
                            {distributor.cidade}
                          </p>
                          <Badge
                            variant="outline"
                            className="border-[#D6DCE5] bg-[#FCFCFB] text-[#475569]"
                          >
                            {distributor.estado_uf}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-[#D6DCE5] bg-[#FCFCFB] capitalize",
                            getTypeTone(distributor.tipo)
                          )}
                        >
                          {distributor.tipo.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[#111827]">
                              {formatNumber(distributor.timesRecommended)}
                            </p>
                            <p className="text-xs text-[#8A94A6]">
                              {relativeToLeader.toFixed(0)}% do lider
                            </p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#E8ECF2]">
                            <div
                              className="h-full rounded-full bg-[#D97706]"
                              style={{
                                width: `${Math.max(relativeToLeader, 8)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {distributor.lastRecommendedAt ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-[#111827]">
                              {formatRelativeTime(distributor.lastRecommendedAt)}
                            </p>
                            <p className="text-xs text-[#8A94A6]">
                              {formatDate(distributor.lastRecommendedAt)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-[#8A94A6]">
                            Sem historico
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  helper,
  accent,
  icon,
}: {
  label: string
  value: string
  helper: string
  accent: string
  icon: ReactNode
}) {
  return (
    <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8A94A6]">{helper}</p>
    </Card>
  )
}

function getTypeTone(type: string) {
  const normalized = type.toLowerCase()

  if (normalized.includes("master")) {
    return "text-[#B2121A]"
  }

  if (normalized.includes("regional")) {
    return "text-[#2563EB]"
  }

  return "text-[#475569]"
}

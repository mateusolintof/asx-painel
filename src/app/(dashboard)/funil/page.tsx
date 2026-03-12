import { Card } from "@/components/ui/card"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { getFunnelData, type FunnelStage } from "@/lib/queries/funnel"
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
  const stageMap = new Map(funnel.summary.map((stage) => [stage.stage, stage]))

  const entryStages = [
    stageMap.get("Formulários"),
    stageMap.get("CNPJ Válido"),
    stageMap.get("Distribuidor (P2)"),
    stageMap.get("Qualificado (P3)"),
  ].filter(Boolean) as FunnelStage[]

  const pipelineStages = [
    stageMap.get("Contatado"),
    stageMap.get("Em Conversa"),
    stageMap.get("Handoff"),
  ].filter(Boolean) as FunnelStage[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">
            {period ? "Período personalizado" : "Todos os leads"}
          </p>
          <p className="mt-1 max-w-3xl text-sm text-[#94A3B8]">
            Entrada, validação e desvio para distribuidores aparecem separados do
            fluxo principal de handoff. Assim as taxas do Path 3 permanecem
            coerentes com a operação comercial real.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {entryStages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {entryStages.map((stage) => (
            <StageSummaryCard
              key={stage.stage}
              stage={stage}
              helper={
                stage.stage === "Distribuidor (P2)"
                  ? "desvio operacional"
                  : stage.stage === "Qualificado (P3)"
                    ? "segue no funil"
                    : "etapa de entrada"
              }
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.95fr)]">
        <Card className="bg-white px-4 md:px-5">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#111827]">
              Funil Principal (Path 3)
            </h2>
            <p className="text-sm text-[#6B7280]">
              Cada etapa mostra o volume atual, a participação no total e a taxa
              de retenção em relação ao estágio anterior.
            </p>
          </div>

          <FunnelChart data={funnel.chart} />
        </Card>

        <div className="space-y-4">
          <Card className="bg-white px-4 md:px-5">
            <div className="space-y-1">
              <h2 className="text-base font-medium text-[#111827]">
                Desvio Operacional
              </h2>
              <p className="text-sm text-[#6B7280]">
                Leads com CNPJ válido que não entram no handoff e seguem para o
                fluxo de distribuidores.
              </p>
            </div>

            <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#92400E]">
                    Distribuidor (P2)
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
                    {formatNumber(stageMap.get("Distribuidor (P2)")?.count ?? 0)}
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#92400E] ring-1 ring-inset ring-[#FCD34D]">
                  {formatPercent(
                    stageMap.get("Distribuidor (P2)")?.fromPreviousRate ?? 0
                  )}{" "}
                  dos CNPJs válidos
                </div>
              </div>
              <p className="mt-3 text-sm text-[#A16207]">
                Esse volume sai do fluxo principal antes da qualificação do
                vendedor, então deve ser lido como branch de atendimento e não
                como queda do pipeline Path 3.
              </p>
            </div>
          </Card>

          <Card className="bg-white px-4 md:px-5">
            <div className="space-y-1">
              <h2 className="text-base font-medium text-[#111827]">
                Pipeline de Handoff
              </h2>
              <p className="text-sm text-[#6B7280]">
                Leitura rápida das etapas finais do fluxo comercial.
              </p>
            </div>

            <div className="grid gap-3">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        {stage.stage}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {formatPercent(stage.percentage)} do total de leads
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold tracking-tight text-[#111827]">
                        {formatNumber(stage.count)}
                      </p>
                      <p className="text-xs font-medium text-[#6B7280]">
                        {formatPercent(stage.fromPreviousRate ?? 0)} da etapa anterior
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {funnel.conversions.length > 0 ? (
        <Card className="bg-white px-4 md:px-5">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#111827]">
              Taxas de Conversão
            </h2>
            <p className="text-sm text-[#6B7280]">
              Cada linha mostra quantos leads avançaram, quantos ficaram pelo
              caminho e qual foi a retenção da etapa.
            </p>
          </div>

          <div className="grid gap-3">
            {funnel.conversions.map((step) => (
              <div
                key={step.label}
                className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="min-w-0 lg:w-56">
                    <p className="text-sm font-medium text-[#111827]">{step.label}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {formatNumber(step.next)} de {formatNumber(step.base)} avançaram
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#EDF2F7]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(step.rate, 100)}%`,
                          backgroundColor: step.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-right lg:w-56">
                    <Metric label="retenção" value={formatPercent(step.rate)} />
                    <Metric label="avançaram" value={formatNumber(step.next)} />
                    <Metric label="quedaram" value={formatNumber(step.drop)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function StageSummaryCard({
  stage,
  helper,
}: {
  stage: FunnelStage
  helper: string
}) {
  return (
    <Card className="bg-white px-4">
      <div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: stage.color }}
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#111827]">{stage.stage}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8]">
          {helper}
        </p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-[#111827]">
          {formatNumber(stage.count)}
        </p>
        <div className="text-right text-xs text-[#6B7280]">
          <p>{formatPercent(stage.percentage)} do total</p>
          <p>{formatPercent(stage.fromPreviousRate ?? stage.percentage)} de retenção</p>
        </div>
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#94A3B8]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}

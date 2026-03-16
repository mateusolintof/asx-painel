import { Card } from "@/components/ui/card"
import { BusinessDisclaimer } from "@/components/dashboard/business-disclaimer"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { getFunnelData, type FunnelStage } from "@/lib/queries/funnel"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>
}

const STAGE_DISCLAIMERS: Record<
  string,
  {
    title: string
    description: string
    sections: { label: string; content: string }[]
  }
> = {
  Entradas: {
    title: "Entradas",
    description: "Base total de leads captados no período.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "Todo lead recebido e gravado na base, antes de qualquer triagem comercial.",
      },
      {
        label: "Na prática",
        content:
          "É o topo do funil e representa toda a demanda que chegou para a operação.",
      },
    ],
  },
  "CNPJ Válido": {
    title: "CNPJ válido",
    description: "Leads cujo documento passou na validação inicial.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "Somente os leads com CNPJ considerado válido pela etapa de enriquecimento e conferência.",
      },
      {
        label: "Na prática",
        content:
          "Mostra quanto da base captada chegou minimamente apta para seguir nas regras comerciais.",
      },
    ],
  },
  "Encaminhado a parceiro": {
    title: "Rede parceira",
    description: "Leads válidos que não entram no fluxo interno da ASX.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "Leads que passaram na validação, mas foram redirecionados para distribuidores por regra comercial.",
      },
      {
        label: "Na prática",
        content:
          "Esse número não representa perda pura do funil principal, e sim um desvio operacional para atendimento externo.",
      },
    ],
  },
  "Operacao ASX": {
    title: "Operacao ASX",
    description: "Leads que ficaram no pipeline comercial da ASX.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "Leads classificados no Path 3, que permanecem sob responsabilidade do atendimento interno.",
      },
      {
        label: "Na prática",
        content:
          "É o volume que efetivamente vira fila de qualificação e potencial handoff para vendedor.",
      },
    ],
  },
  "Primeiro contato": {
    title: "Primeiro contato",
    description: "Leads do atendimento interno que já saíram do status pendente.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "O painel considera aqui os leads Path 3 que já chegaram pelo menos ao status 'contacted'. Também entram os que já avançaram além disso, como 'em conversa' e 'transferido'.",
      },
      {
        label: "Na prática",
        content:
          "Esse número mostra quantos leads do fluxo interno já receberam o primeiro avanço operacional e deixaram de estar apenas aguardando ação.",
      },
    ],
  },
  "Em Conversa": {
    title: "Em atendimento",
    description: "Leads do atendimento interno que já entraram em interação ativa.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "São os leads Path 3 que atingiram o status 'in_conversation'. Os que já foram transferidos também aparecem aqui porque necessariamente passaram por essa etapa antes do handoff.",
      },
      {
        label: "Na prática",
        content:
          "Mostra quantas oportunidades já viraram conversa de fato, e não apenas tentativa inicial de contato.",
      },
    ],
  },
  "Com vendedor": {
    title: "Com vendedor",
    description: "Leads que concluíram a passagem do atendimento inicial para o comercial.",
    sections: [
      {
        label: "O que entra na conta",
        content:
          "Somente os leads com status final de handoff concluído para o vendedor.",
      },
      {
        label: "Na prática",
        content:
          "É o volume que atravessou o funil interno e chegou ao momento em que o vendedor passa a assumir a oportunidade.",
      },
    ],
  },
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
    stageMap.get("Entradas"),
    stageMap.get("CNPJ Válido"),
    stageMap.get("Encaminhado a parceiro"),
    stageMap.get("Operacao ASX"),
  ].filter(Boolean) as FunnelStage[]

  const pipelineStages = [
    stageMap.get("Primeiro contato"),
    stageMap.get("Em Conversa"),
    stageMap.get("Com vendedor"),
  ].filter(Boolean) as FunnelStage[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">
            {period ? "Período personalizado" : "Todos os leads"}
          </p>
          <p className="mt-1 max-w-3xl text-sm text-[#94A3B8]">
            A leitura separa triagem inicial, rede parceira e avancos da
            operacao ASX sem misturar fluxos diferentes.
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
                stage.stage === "Encaminhado a parceiro"
                  ? "segue para parceiro"
                  : stage.stage === "Operacao ASX"
                    ? "segue para a ASX"
                    : stage.stage === "CNPJ Válido"
                      ? "documento conferido"
                      : "base recebida"
              }
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.95fr)]">
        <Card className="bg-white px-4 md:px-5">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#111827]">
              Jornada da operacao ASX
            </h2>
            <p className="text-sm text-[#6B7280]">
              Cada etapa mostra o volume atual, a participacao no total e a taxa
              de retenção em relação ao estágio anterior.
            </p>
          </div>

          <FunnelChart data={funnel.chart} />
        </Card>

        <div className="space-y-4">
          <Card className="bg-white px-4 md:px-5">
            <div className="space-y-1">
              <h2 className="text-base font-medium text-[#111827]">
                Fluxo para rede parceira
              </h2>
              <p className="text-sm text-[#6B7280]">
                Leads com CNPJ valido que nao seguem na operacao ASX e sao
                enviados para parceiros regionais.
              </p>
            </div>

            <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#92400E]">
                    Rede parceira
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
                    {formatNumber(stageMap.get("Encaminhado a parceiro")?.count ?? 0)}
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#92400E] ring-1 ring-inset ring-[#FCD34D]">
                  {formatPercent(
                    stageMap.get("Encaminhado a parceiro")?.fromPreviousRate ?? 0
                  )}{" "}
                  dos CNPJs validos
                </div>
              </div>
              <p className="mt-3 text-sm text-[#A16207]">
                Esse volume sai do fluxo principal antes de chegar a um
                vendedor, entao deve ser lido como encaminhamento alternativo e
                nao como queda do funil.
              </p>
            </div>
          </Card>

          <Card className="bg-white px-4 md:px-5">
            <div className="space-y-1">
              <h2 className="text-base font-medium text-[#111827]">
                Etapas finais da operacao
              </h2>
              <p className="text-sm text-[#6B7280]">
                Leitura rapida do avanco da ASX ate chegar ao vendedor.
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#111827]">
                        {stage.stage}
                      </p>
                      <BusinessDisclaimer
                        {...STAGE_DISCLAIMERS[stage.stage]}
                        side="left"
                      />
                    </div>
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
              Taxas de Conversao
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
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#111827]">{stage.stage}</p>
          <BusinessDisclaimer
            {...STAGE_DISCLAIMERS[stage.stage]}
            side="bottom"
            align="start"
          />
        </div>
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

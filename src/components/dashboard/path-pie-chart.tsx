"use client"

import {
  BadgeAlert,
  Building2,
  BriefcaseBusiness,
} from "lucide-react"
import { BusinessDisclaimer } from "@/components/dashboard/business-disclaimer"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface PathPieChartProps {
  data: { name: string; value: number; fill: string }[]
}

const DESTINATION_HELPERS: Record<string, string> = {
  "Fora do perfil": "contatos descartados antes do atendimento",
  "Rede parceira": "seguiram para parceiros regionais",
  "Operacao ASX": "seguiram para o time comercial da ASX",
}

const DESTINATION_DISCLAIMERS: Record<
  string,
  {
    title: string
    description: string
    sections: { label: string; content: string }[]
  }
> = {
  "Fora do perfil": {
    title: "Fora do perfil",
    description: "Leads que não seguiram para atendimento comercial.",
    sections: [
      {
        label: "O que significa",
        content:
          "Entram aqui os contatos que foram barrados logo na triagem inicial, como casos de CNPJ inválido ou enquadramento fora da política comercial.",
      },
      {
        label: "Na prática",
        content:
          "É o volume de entradas que consumiu captação, mas não virou oportunidade de atendimento para a ASX nem para parceiros.",
      },
    ],
  },
  "Rede parceira": {
    title: "Rede parceira",
    description: "Leads que saíram da operação interna e foram redirecionados.",
    sections: [
      {
        label: "O que significa",
        content:
          "São leads válidos, mas que não entram no atendimento interno da ASX por regra comercial, como região fora do foco ou volume abaixo do corte definido.",
      },
      {
        label: "Na prática",
        content:
          "Esse número mostra quanto da demanda foi aproveitada pela rede parceira, em vez de virar oportunidade direta para o time interno.",
      },
    ],
  },
  "Operacao ASX": {
    title: "Operacao ASX",
    description: "Leads que ficaram sob responsabilidade direta da ASX.",
    sections: [
      {
        label: "O que significa",
        content:
          "São os leads classificados no Path 3: passaram na triagem, se encaixaram nas regras comerciais e entraram na fila de atendimento da ASX.",
      },
      {
        label: "Participação interna",
        content:
          "A participação mostrada no card é a fatia desse grupo dentro de todas as entradas do período. Em linguagem de negócio, ela mostra quanto da demanda captada realmente ficou para o time interno trabalhar.",
      },
    ],
  },
}

export function PathPieChart({ data }: PathPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280]">
        Sem dados
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
              Resumo do periodo
            </p>
            <p className="text-3xl font-semibold tracking-tight text-[#111827]">
              {formatNumber(total)}
            </p>
            <p className="max-w-xl text-sm text-[#6B7280]">
              leads distribuidos entre descarte, rede parceira e time comercial
              interno.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {data.map((item) => {
              const share = total > 0 ? (item.value / total) * 100 : 0

              return (
                <div
                  key={item.name}
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
                    {item.name}
                  </p>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <p className="text-2xl font-semibold tracking-tight text-[#111827]">
                      {formatNumber(item.value)}
                    </p>
                    <p className="text-xs font-medium text-[#6B7280]">
                      {formatPercent(share)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[#E8ECF2]">
          {data.map((item) => {
            const share = total > 0 ? (item.value / total) * 100 : 0

            if (share === 0) return null

            return (
              <div
                key={item.name}
                className="h-full"
                style={{
                  width: `${share}%`,
                  backgroundColor: item.fill,
                }}
              />
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {data.map((item) => {
          const share = total > 0 ? (item.value / total) * 100 : 0
          const Icon = getDestinationIcon(item.name)

          return (
            <div
              key={item.name}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${item.fill}14`, color: item.fill }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#111827]">
                        {item.name}
                      </p>
                      <BusinessDisclaimer
                        title={DESTINATION_DISCLAIMERS[item.name]?.title ?? item.name}
                        description={
                          DESTINATION_DISCLAIMERS[item.name]?.description ??
                          "Explicação do destino operacional."
                        }
                        sections={
                          DESTINATION_DISCLAIMERS[item.name]?.sections ?? [
                            {
                              label: "Como ler",
                              content: "Representa a participação desse destino dentro do período analisado.",
                            },
                          ]
                        }
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#8A94A6]">
                      {DESTINATION_HELPERS[item.name] ?? "destino operacional"}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-[#111827]">
                  {formatNumber(item.value)}
                </p>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${share}%`,
                    backgroundColor: item.fill,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#6B7280]">
                <span>participação entre as entradas</span>
                <span className="font-medium text-[#475569]">
                  {formatPercent(share)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getDestinationIcon(name: string) {
  if (name === "Fora do perfil") return BadgeAlert
  if (name === "Rede parceira") return Building2
  return BriefcaseBusiness
}

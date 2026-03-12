import { Bot, User, UserRound, Building2, Clock3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PathBadge } from "@/components/dashboard/path-badge"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { LeadDetailData } from "@/lib/queries/leads"
import { PRIORITY_LABELS } from "@/lib/utils/constants"
import {
  formatCNPJ,
  formatDateTime,
  formatPhone,
  formatRelativeTime,
} from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface LeadDetailSectionsProps {
  data: LeadDetailData
  dense?: boolean
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
}

export function LeadDetailSections({
  data,
  dense = false,
}: LeadDetailSectionsProps) {
  const { fbLead, qualifiedLead, assignment, messages, recommendations, seller } =
    data
  const cardPadding = dense ? "p-4 md:p-5" : "p-5"
  const contentGap = dense ? "space-y-4" : "space-y-5"
  const gridClass = dense
    ? "grid-cols-1 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]"
    : "xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"

  return (
    <div className={cn("grid gap-4", gridClass)}>
      <div className={contentGap}>
        <Card className={cn("rounded-2xl border border-[#E5E7EB] bg-white", cardPadding)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#111827]">
                Dados do lead
              </h3>
              <p className="text-xs text-[#6B7280]">
                Campos persistidos pelo pipeline comercial e validados para
                consulta operacional.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PathBadge path={fbLead.path} />
              <StatusBadge status={fbLead.status} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="Telefone" value={formatPhone(fbLead.telefone)} />
            <Detail label="Email" value={fbLead.email ?? "Nao informado"} />
            <Detail
              label="Empresa"
              value={fbLead.nome_fantasia ?? fbLead.razao_social ?? "Nao identificada"}
            />
            <Detail label="Estado" value={fbLead.estado_envio} />
            <Detail
              label="CNPJ"
              value={fbLead.cnpj ? formatCNPJ(fbLead.cnpj) : "Nao informado"}
            />
            <Detail label="Perfil" value={fbLead.perfil} />
            <Detail label="Volume" value={fbLead.volume_faixa} />
            <Detail
              label="Criado em"
              value={formatDateTime(fbLead.created_at)}
            />
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F7F7F6] px-3 py-2.5 text-xs text-[#6B7280]">
            Respostas extras do formulario do Facebook so aparecem aqui se
            estiverem persistidas na base. Hoje o painel exibe os campos
            operacionais disponiveis no pipeline.
          </div>

          {fbLead.cnpj_valido ? (
            <>
              <Separator className="my-4" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail
                  label="Razao Social"
                  value={fbLead.razao_social ?? "Nao informada"}
                />
                <Detail
                  label="Nome Fantasia"
                  value={fbLead.nome_fantasia ?? "Nao informado"}
                />
                <Detail label="CNAE" value={fbLead.cnae ?? "Nao informado"} />
                <Detail
                  label="Cidade / UF"
                  value={
                    fbLead.cnpj_city || fbLead.cnpj_state
                      ? `${fbLead.cnpj_city ?? "Cidade"} / ${fbLead.cnpj_state ?? "UF"}`
                      : "Nao informado"
                  }
                />
              </div>
            </>
          ) : null}
        </Card>

        {qualifiedLead ? (
          <Card className={cn("rounded-2xl border border-[#E5E7EB] bg-white", cardPadding)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#111827]">
                  Qualificacao e handoff
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Tudo o que o time precisa para decidir a proxima acao.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {qualifiedLead.class ? (
                  <ScoreBadge
                    scoreClass={qualifiedLead.class}
                    score={qualifiedLead.score ?? undefined}
                  />
                ) : null}
                {qualifiedLead.priority ? (
                  <Badge
                    variant="outline"
                    className={
                      PRIORITY_COLORS[qualifiedLead.priority] ??
                      PRIORITY_COLORS.medium
                    }
                  >
                    {PRIORITY_LABELS[qualifiedLead.priority]}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail label="Regiao" value={qualifiedLead.regiao} />
              <Detail label="Volume" value={qualifiedLead.volume} />
              <Detail
                label="Ja compra ASX?"
                value={toBooleanLabel(qualifiedLead.ja_compra_asx_regiao === "sim")}
              />
              <Detail
                label="NFs enviadas?"
                value={toBooleanLabel(qualifiedLead.nfs_enviadas)}
              />
              <Detail
                label="Empresa recente?"
                value={toBooleanLabel(qualifiedLead.empresa_recente)}
              />
              <Detail
                label="Qualificado em"
                value={formatDateTime(qualifiedLead.qualified_at)}
              />
              <Detail
                label="Vendedor"
                value={seller?.name ?? "Ainda nao transferido"}
              />
              <Detail
                label="Transferido em"
                value={assignment?.assigned_at ? formatDateTime(assignment.assigned_at) : "Sem registro"}
              />
            </div>
          </Card>
        ) : null}

        {recommendations.length > 0 ? (
          <Card className={cn("rounded-2xl border border-[#E5E7EB] bg-white", cardPadding)}>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#111827]">
                Distribuidores recomendados
              </h3>
              <p className="text-xs text-[#6B7280]">
                Indicacoes acionadas para leads desviados ao fluxo de
                distribuidores.
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {recommendations.map((recommendation, index) => (
                <div
                  key={`${recommendation.distributors?.razao_social ?? "dist"}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#FCFCFB] px-3.5 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium text-[#111827]">
                      {recommendation.distributors?.razao_social ?? "Distribuidor"}
                    </p>
                    <p className="truncate text-xs text-[#6B7280]">
                      {recommendation.distributors?.cidade ?? "Cidade"} /{" "}
                      {recommendation.distributors?.estado_uf ?? "UF"}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#F3F4F6] p-2 text-[#6B7280]">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <Card className={cn("rounded-2xl border border-[#E5E7EB] bg-white", cardPadding)}>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#111827]">
            Conversa com o agente
          </h3>
          <p className="text-xs text-[#6B7280]">
            {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"} no
            historico visivel.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
            Nenhuma mensagem registrada para este lead.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {messages.map((message) => {
              const isAssistant = message.direction === "assistant"
              const isVendor = message.direction === "vendor"
              const icon = isAssistant ? (
                <Bot className="h-3.5 w-3.5" />
              ) : isVendor ? (
                <UserRound className="h-3.5 w-3.5" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2.5",
                    !isAssistant && !isVendor && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      isAssistant && "bg-[#B2121A] text-white",
                      isVendor && "bg-amber-100 text-amber-700",
                      !isAssistant && !isVendor && "bg-[#E5E7EB] text-[#4B5563]"
                    )}
                  >
                    {icon}
                  </div>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-3",
                      isAssistant && "bg-[#F8F1F1] text-[#111827]",
                      isVendor && "bg-amber-50 text-[#111827]",
                      !isAssistant && !isVendor && "bg-[#F3F4F6] text-[#111827]"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-5">
                      {message.content}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                      <Clock3 className="h-3 w-3" />
                      <span>{formatDateTime(message.created_at)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1 rounded-xl border border-[#F0F1F3] bg-[#FCFCFC] px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8A94A6]">
        {label}
      </p>
      <p className="break-words text-sm font-medium leading-6 text-[#111827]">
        {value}
      </p>
    </div>
  )
}

function toBooleanLabel(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "Nao informado"
  return value ? "Sim" : "Nao"
}

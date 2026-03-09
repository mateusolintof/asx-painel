import { notFound } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PathBadge } from "@/components/dashboard/path-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { getLeadById } from "@/lib/queries/leads"
import { formatPhone, formatCNPJ, formatDateTime } from "@/lib/utils/format"
import { ArrowLeft, MessageCircle, User } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const data = await getLeadById(id)

  if (!data) notFound()

  const { fbLead, qualifiedLead, messages, recommendations, seller } = data

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">{fbLead.nome}</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            {fbLead.nome_fantasia ?? fbLead.razao_social ?? "Empresa n\u00e3o identificada"}
          </p>
        </div>
        <div className="flex gap-2">
          <PathBadge path={fbLead.path} />
          <StatusBadge status={fbLead.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead Details — 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border bg-white p-6">
            <h3 className="mb-4 text-base font-medium text-[#111827]">Dados do Lead</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Telefone" value={formatPhone(fbLead.telefone)} />
              <Detail label="Email" value={fbLead.email ?? "\u2014"} />
              <Detail label="CNPJ" value={fbLead.cnpj ? formatCNPJ(fbLead.cnpj) : "\u2014"} />
              <Detail label="Estado" value={fbLead.estado_envio} />
              <Detail label="Perfil" value={fbLead.perfil} />
              <Detail label="Volume" value={fbLead.volume_faixa} />
              <Detail label="Path" value={`${fbLead.path} \u2014 ${fbLead.path_reason ?? ""}`} />
              <Detail label="Criado em" value={formatDateTime(fbLead.created_at)} />
            </div>

            {fbLead.cnpj_valido && (
              <>
                <Separator className="my-4" />
                <h4 className="mb-3 text-sm font-medium text-[#6B7280]">
                  Dados da Receita Federal
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label="Raz\u00e3o Social" value={fbLead.razao_social ?? "\u2014"} />
                  <Detail label="Nome Fantasia" value={fbLead.nome_fantasia ?? "\u2014"} />
                  <Detail label="CNAE" value={fbLead.cnae ?? "\u2014"} />
                  <Detail label="Cidade/UF" value={`${fbLead.cnpj_city ?? ""} / ${fbLead.cnpj_state ?? ""}`} />
                </div>
              </>
            )}
          </Card>

          {/* Score & Handoff (Path 3 only) */}
          {qualifiedLead && (
            <Card className="border bg-white p-6">
              <h3 className="mb-4 text-base font-medium text-[#111827]">
                Qualifica\u00e7\u00e3o & Handoff
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Score</span>
                  <div className="mt-1">
                    <ScoreBadge
                      scoreClass={qualifiedLead.class}
                      score={qualifiedLead.score}
                    />
                  </div>
                </div>
                <Detail
                  label="J\u00e1 compra ASX?"
                  value={qualifiedLead.ja_compra_asx_regiao === "sim" ? "Sim" : "N\u00e3o"}
                />
                <Detail
                  label="NFs enviadas?"
                  value={qualifiedLead.nfs_enviadas ? "Sim" : "N\u00e3o"}
                />
                <Detail
                  label="Empresa recente?"
                  value={qualifiedLead.empresa_recente ? "Sim" : "N\u00e3o"}
                />
                {seller && (
                  <Detail label="Vendedor" value={seller.name} />
                )}
                <Detail
                  label="Qualificado em"
                  value={formatDateTime(qualifiedLead.qualified_at)}
                />
              </div>
            </Card>
          )}

          {/* Distributor Recommendations (Path 2) */}
          {recommendations.length > 0 && (
            <Card className="border bg-white p-6">
              <h3 className="mb-4 text-base font-medium text-[#111827]">
                Distribuidores Recomendados
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border border-[#E5E7EB] px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-[#111827]">
                      {rec.distributors?.razao_social}
                    </span>
                    <span className="text-[#6B7280]">
                      {rec.distributors?.cidade}/{rec.distributors?.estado_uf}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Conversation Timeline — 1 col */}
        <Card className="border bg-white p-6">
          <h3 className="mb-4 text-base font-medium text-[#111827]">
            Conversa ({messages.length} mensagens)
          </h3>
          {messages.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Nenhuma mensagem registrada</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.direction === "assistant" ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-medium ${
                      msg.direction === "assistant"
                        ? "bg-[#B2121A] text-white"
                        : "bg-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    {msg.direction === "assistant" ? (
                      <MessageCircle className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.direction === "assistant"
                        ? "bg-[#F3F4F6] text-[#111827]"
                        : "bg-[#B2121A]/5 text-[#111827]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="mt-1 text-[10px] text-[#9CA3AF]">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[#6B7280]">{label}</span>
      <p className="mt-0.5 font-medium text-[#111827]">{value}</p>
    </div>
  )
}

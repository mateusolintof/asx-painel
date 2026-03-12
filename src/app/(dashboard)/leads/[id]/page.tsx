import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LeadDetailSections } from "@/components/dashboard/lead-detail-sections"
import { PathBadge } from "@/components/dashboard/path-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getLeadById } from "@/lib/queries/leads"

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const data = await getLeadById(id)

  if (!data) notFound()

  const { fbLead, qualifiedLead, messages, recommendations, seller } = data

  return (
    <div className="space-y-5">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Leads
      </Link>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A94A6]">
            Lead selecionado
          </p>
          <h2 className="truncate text-xl font-semibold text-[#111827]">
            {fbLead.nome}
          </h2>
          <p className="text-sm text-[#6B7280]">
            {fbLead.nome_fantasia ??
              fbLead.razao_social ??
              "Empresa nao identificada"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PathBadge path={fbLead.path} />
          <StatusBadge status={fbLead.status} />
          {qualifiedLead?.class ? (
            <span className="text-xs text-[#8A94A6]">
              {messages.length} mensagens • {recommendations.length} recomend
              {recommendations.length === 1 ? "acao" : "acoes"}
              {seller ? ` • ${seller.name}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      <LeadDetailSections data={data} />
    </div>
  )
}

import type { ReactNode } from "react"
import { AlertTriangle, Flame, UserRound } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getLeadById } from "@/lib/queries/leads"
import { getHotLeads } from "@/lib/queries/hot-leads"
import { HotLeadsTable } from "@/components/dashboard/hot-leads-table"
import { LeadDetailSections } from "@/components/dashboard/lead-detail-sections"
import { LeadDetailsSheet } from "@/components/dashboard/lead-details-sheet"
import { PathBadge } from "@/components/dashboard/path-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"

interface Props {
  searchParams: Promise<{
    leadId?: string
  }>
}

export default async function LeadsQuentesPage({ searchParams }: Props) {
  const params = await searchParams
  const hotLeads = await getHotLeads()
  const urgent = hotLeads.filter((lead) => lead.priority === "urgent")
  const stale = hotLeads.filter((lead) => lead.hours_waiting > 24)
  const assigned = hotLeads.filter((lead) => Boolean(lead.vendedor))
  const selectedLead = params.leadId ? await getLeadById(params.leadId) : null

  return (
    <>
      <div className="space-y-4">
        {stale.length > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-[#B2121A]" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-[#B2121A]">
                {stale.length} lead{stale.length === 1 ? "" : "s"} sem atividade
                ha mais de 24h
              </p>
              <p className="text-xs text-[#B2121A]/80">
                Priorize retorno rapido ou acione o vendedor responsavel.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Em acompanhamento"
            value={hotLeads.length}
            accentClass="border-l-[#B2121A]"
          />
          <SummaryCard
            title="Prioridade maxima"
            value={urgent.length}
            accentClass="border-l-[#EF4444]"
            icon={<Flame className="h-4 w-4 text-[#EF4444]" />}
          />
          <SummaryCard
            title="Com vendedor"
            value={assigned.length}
            accentClass="border-l-[#D97706]"
            icon={<UserRound className="h-4 w-4 text-[#D97706]" />}
          />
        </div>

        <HotLeadsTable leads={hotLeads} selectedLeadId={params.leadId} />
      </div>

      {selectedLead ? (
        <LeadDetailsSheet
          leadId={selectedLead.fbLead.id}
          title={selectedLead.fbLead.nome}
          subtitle={
            selectedLead.fbLead.nome_fantasia ??
            selectedLead.fbLead.razao_social ??
            "Empresa nao identificada"
          }
          badges={
            <>
              <PathBadge path={selectedLead.fbLead.path} />
              <StatusBadge status={selectedLead.fbLead.status} />
            </>
          }
        >
          <LeadDetailSections data={selectedLead} dense />
        </LeadDetailsSheet>
      ) : null}
    </>
  )
}

function SummaryCard({
  title,
  value,
  accentClass,
  icon,
}: {
  title: string
  value: number
  accentClass: string
  icon?: ReactNode
}) {
  return (
    <Card className={`border border-[#E5E7EB] border-l-4 bg-white p-4 ${accentClass}`}>
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
    </Card>
  )
}

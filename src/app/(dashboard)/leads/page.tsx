import { getLeads } from "@/lib/queries/leads"
import { getLeadById } from "@/lib/queries/leads"
import { LeadDetailSections } from "@/components/dashboard/lead-detail-sections"
import { LeadDetailsSheet } from "@/components/dashboard/lead-details-sheet"
import { LeadTable } from "@/components/dashboard/lead-table"
import { PathBadge } from "@/components/dashboard/path-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { LeadStatus } from "@/lib/types/database"

interface Props {
  searchParams: Promise<{
    page?: string
    path?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    leadId?: string
  }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams

  const result = await getLeads({
    page: params.page ? Number(params.page) : 1,
    path: params.path ? (Number(params.path) as 1 | 2 | 3) : undefined,
    status: params.status as LeadStatus | undefined,
    search: params.search ?? undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })
  const selectedLead =
    params.leadId ? await getLeadById(params.leadId) : null

  return (
    <>
      <LeadTable
        leads={result.leads}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        selectedLeadId={params.leadId}
      />

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

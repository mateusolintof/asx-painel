import { getLeads } from "@/lib/queries/leads"
import { LeadTable } from "@/components/dashboard/lead-table"
import type { LeadStatus } from "@/lib/types/database"

interface Props {
  searchParams: Promise<{
    page?: string
    path?: string
    status?: string
    search?: string
  }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams

  const result = await getLeads({
    page: params.page ? Number(params.page) : 1,
    path: params.path ? (Number(params.path) as 1 | 2 | 3) : undefined,
    status: params.status as LeadStatus | undefined,
    search: params.search ?? undefined,
  })

  return (
    <LeadTable
      leads={result.leads}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
    />
  )
}

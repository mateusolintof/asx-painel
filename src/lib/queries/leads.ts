import { createClient } from "@/lib/supabase/server"
import type { FbLead, LeadFilters } from "@/lib/types/database"

const PAGE_SIZE = 20

export async function getLeads(filters: LeadFilters = {}) {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? PAGE_SIZE
  const offset = (page - 1) * pageSize

  let query = supabase
    .from("fb_leads")
    .select("*", { count: "exact" })

  if (filters.path) {
    query = query.eq("path", filters.path)
  }
  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.from) {
    query = query.gte("created_at", filters.from)
  }
  if (filters.to) {
    query = query.lte("created_at", filters.to)
  }
  if (filters.search) {
    query = query.or(
      `nome.ilike.%${filters.search}%,telefone.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%,razao_social.ilike.%${filters.search}%`
    )
  }

  const sortBy = filters.sortBy ?? "created_at"
  const sortOrder = filters.sortOrder ?? "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  query = query.range(offset, offset + pageSize - 1)

  const { data, count, error } = await query

  return {
    leads: (data ?? []) as FbLead[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getLeadById(id: string) {
  const supabase = await createClient()

  const { data: fbLead } = await supabase
    .from("fb_leads")
    .select("*")
    .eq("id", id)
    .single()

  if (!fbLead) return null

  // Buscar lead qualificado (se existir)
  const { data: qualifiedLead } = await supabase
    .from("leads")
    .select("*, assignments(*)")
    .eq("contact_id", (
      await supabase
        .from("contacts")
        .select("id")
        .eq("phone", fbLead.telefone)
        .single()
    ).data?.id ?? "")
    .maybeSingle()

  // Buscar mensagens
  const { data: messages } = await supabase
    .from("ia_messages")
    .select("*")
    .eq("phone", fbLead.telefone)
    .order("created_at", { ascending: true })

  // Buscar distribuidores recomendados (Path 2)
  const { data: recommendations } = await supabase
    .from("distributor_recommendations")
    .select("*, distributors(*)")
    .eq("fb_lead_id", fbLead.id)

  // Buscar vendedor atribuido (se handoff)
  let seller = null
  if (qualifiedLead?.assignments?.[0]) {
    const { data: agent } = await supabase
      .from("agents")
      .select("*")
      .eq("id", qualifiedLead.assignments[0].assignee_id)
      .single()
    seller = agent
  }

  return {
    fbLead,
    qualifiedLead,
    messages: messages ?? [],
    recommendations: recommendations ?? [],
    seller,
  }
}

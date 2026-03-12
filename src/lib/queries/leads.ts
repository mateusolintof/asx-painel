import { createClient } from "@/lib/supabase/server"
import type {
  Agent,
  Assignment,
  FbLead,
  IaMessage,
  Lead,
  LeadFilters,
} from "@/lib/types/database"
import { throwQueryError } from "@/lib/queries/errors"

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
    // Sanitizar: remover caracteres que quebram o filtro PostgREST
    const safe = filters.search.replace(/[,.'"%()]/g, "")
    if (safe.length > 0) {
      query = query.or(
        `nome.ilike.%${safe}%,telefone.ilike.%${safe}%,cnpj.ilike.%${safe}%,razao_social.ilike.%${safe}%`
      )
    }
  }

  const ALLOWED_SORT = ["created_at", "nome", "status", "path", "estado_envio"] as const
  const sortBy = ALLOWED_SORT.includes(filters.sortBy as (typeof ALLOWED_SORT)[number])
    ? filters.sortBy!
    : "created_at"
  const sortOrder = filters.sortOrder ?? "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  query = query.range(offset, offset + pageSize - 1)

  const { data, count, error } = await query

  throwQueryError("Falha ao carregar lista de leads", error)

  return {
    leads: (data ?? []) as FbLead[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export interface LeadRecommendation {
  distributors?: {
    razao_social?: string | null
    cidade?: string | null
    estado_uf?: string | null
  } | null
}

export interface LeadDetailData {
  fbLead: FbLead
  qualifiedLead: Lead | null
  assignment: Assignment | null
  messages: IaMessage[]
  recommendations: LeadRecommendation[]
  seller: Agent | null
}

export async function getLeadById(id: string): Promise<LeadDetailData | null> {
  const supabase = await createClient()

  const { data: fbLead, error: fbErr } = await supabase
    .from("fb_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  throwQueryError("Falha ao carregar lead", fbErr)
  if (fbErr || !fbLead) return null

  // Buscar contato pelo telefone
  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .select("id")
    .eq("phone", fbLead.telefone)
    .maybeSingle()

  throwQueryError("Falha ao carregar contato do lead", contactErr)

  // Buscar lead qualificado (se existir contato)
  let qualifiedLead: Lead | null = null
  let assignment: Assignment | null = null
  if (contact?.id) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("contact_id", contact.id)
      .maybeSingle()
    throwQueryError("Falha ao carregar qualificacao do lead", error)
    qualifiedLead = (data as Lead | null) ?? null
  }

  if (qualifiedLead?.id) {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("lead_id", qualifiedLead.id)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    throwQueryError("Falha ao carregar atribuicao do lead", error)
    assignment = (data as Assignment | null) ?? null
  }

  // Buscar mensagens
  const { data: messages, error: messagesErr } = await supabase
    .from("ia_messages")
    .select("*")
    .eq("phone", fbLead.telefone)
    .order("created_at", { ascending: true })

  throwQueryError("Falha ao carregar mensagens do lead", messagesErr)

  // Buscar distribuidores recomendados (Path 2)
  const { data: recommendations, error: recommendationsErr } = await supabase
    .from("distributor_recommendations")
    .select("*, distributors(*)")
    .eq("fb_lead_id", fbLead.id)

  throwQueryError("Falha ao carregar recomendacoes do lead", recommendationsErr)

  // Buscar vendedor atribuido (se handoff)
  let seller: Agent | null = null
  if (assignment?.assignee_id) {
    const { data: agent, error: agentErr } = await supabase
      .from("agents")
      .select("*")
      .eq("id", assignment.assignee_id)
      .single()
    throwQueryError("Falha ao carregar vendedor do lead", agentErr)
    seller = (agent as Agent | null) ?? null
  }

  return {
    fbLead: fbLead as FbLead,
    qualifiedLead,
    assignment,
    messages: (messages ?? []) as IaMessage[],
    recommendations: (recommendations ?? []) as LeadRecommendation[],
    seller,
  }
}

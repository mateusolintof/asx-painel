export interface FbLead {
  id: string
  facebook_lead_id: string
  form_id: string | null
  page_id: string | null
  nome: string
  email: string | null
  telefone_raw: string | null
  telefone: string
  perfil: string
  volume_faixa: string
  volume_numerico: number
  cnpj_raw: string | null
  cnpj: string | null
  cnpj_valido: boolean | null
  razao_social: string | null
  nome_fantasia: string | null
  cnae: string | null
  cnpj_city: string | null
  cnpj_state: string | null
  estado_envio: string
  path: 1 | 2 | 3
  path_reason: string | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

export type LeadStatus =
  | "pending"
  | "contacted"
  | "in_conversation"
  | "handoff_done"
  | "disqualified_cnpj"
  | "disqualified_policy"
  | "send_failed"

export interface Lead {
  id: string
  contact_id: string | null
  company_id: string | null
  perfil: string
  regiao: string
  volume: string
  score: number
  class: ScoreClass
  priority: Priority
  source: string
  qualified_at: string
  ja_compra_asx_regiao: string
  fornecedor_asx_regiao: string | null
  nfs_enviadas: boolean
  empresa_recente: boolean
}

export type ScoreClass = "quente" | "morno" | "frio"
export type Priority = "urgent" | "high" | "medium"

export interface IaMessage {
  id: string
  phone: string
  direction: "user" | "assistant" | "vendor"
  content: string
  session_id: string
  meta: Record<string, unknown> | null
  created_at: string
}

export interface Assignment {
  id: string
  lead_id: string
  assignee_id: number
  assigned_at: string
}

export interface Agent {
  id: number
  name: string
  phone: string
  inbox_id: number
  team_id: number
}

export interface Distributor {
  id: number
  razao_social: string
  cidade: string
  estado: string
  estado_uf: string
  pais: string
  telefone: string | null
  status: string
  tipo_representantes: string
  lat: number | null
  lng: number | null
}

export interface DistributorRecommendation {
  fb_lead_id: string
  distributor_id: number
  recommended_at: string
}

export interface Contact {
  id: string
  phone: string
  name: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  cnpj: string
  legal_name: string
  trade_name: string | null
  cnae: string | null
  city: string | null
  state: string | null
  created_at: string
  updated_at: string
}

// View types
export interface FunnelSummary {
  day: string
  total_leads: number
  path1_disqualified: number
  path2_distributor: number
  path3_qualified: number
  contacted: number
  in_conversation: number
  handoff_done: number
  disqualified_cnpj: number
  disqualified_policy: number
  send_failed: number
}

export interface Path3Pipeline {
  fb_lead_id: string
  nome: string
  telefone: string
  perfil: string
  volume_faixa: string
  volume_numerico: number
  estado_envio: string
  razao_social: string | null
  nome_fantasia: string | null
  status: LeadStatus
  lead_created_at: string
  lead_id: string | null
  score: number | null
  class: ScoreClass | null
  priority: Priority | null
  qualified_at: string | null
  ja_compra_asx_regiao: string | null
  fornecedor_asx_regiao: string | null
  nfs_enviadas: boolean | null
  empresa_recente: boolean | null
  assignee_id: number | null
  vendedor_nome: string | null
  assigned_at: string | null
  hours_to_qualify: number | null
  user_messages: number
  agent_messages: number
}

export interface RegionalPerformance {
  estado: string
  regiao: string
  total_leads: number
  qualified: number
  handoff: number
  avg_score: number | null
  distributors_recommended: number
}

// Filter types
export interface LeadFilters {
  path?: 1 | 2 | 3
  status?: LeadStatus
  from?: string
  to?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface DateRange {
  from: string
  to: string
}

export interface KPI {
  label: string
  value: number
  previousValue?: number
  format?: "number" | "percent" | "currency"
}

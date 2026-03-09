import { createClient } from "@/lib/supabase/server"
import type { DateRange } from "@/lib/types/database"

export interface FunnelStage {
  stage: string
  count: number
  percentage: number
  color: string
}

export async function getFunnelData(period?: DateRange): Promise<FunnelStage[]> {
  const supabase = await createClient()

  let query = supabase
    .from("fb_leads")
    .select("path, status, cnpj_valido")

  if (period) {
    query = query.gte("created_at", period.from).lte("created_at", period.to)
  }

  const { data, error } = await query
  if (error) {
    console.error(`Failed to fetch funnel data: ${error.message}`)
    return []
  }
  const rows = data ?? []
  const total = rows.length

  if (total === 0) {
    return []
  }

  const cnpjValid = rows.filter((r) => r.cnpj_valido === true).length
  const path2 = rows.filter((r) => r.path === 2).length
  const path3 = rows.filter((r) => r.path === 3).length
  const contacted = rows.filter((r) =>
    ["contacted", "in_conversation", "handoff_done"].includes(r.status)
  ).length
  const inConversation = rows.filter((r) =>
    ["in_conversation", "handoff_done"].includes(r.status)
  ).length
  const handoff = rows.filter((r) => r.status === "handoff_done").length

  const pct = (v: number) => Math.round((v / total) * 100 * 10) / 10

  return [
    { stage: "Formul\u00e1rios", count: total, percentage: 100, color: "#6366f1" },
    { stage: "CNPJ V\u00e1lido", count: cnpjValid, percentage: pct(cnpjValid), color: "#8b5cf6" },
    { stage: "Distribuidor (P2)", count: path2, percentage: pct(path2), color: "#f59e0b" },
    { stage: "Qualificado (P3)", count: path3, percentage: pct(path3), color: "#10b981" },
    { stage: "Contatado", count: contacted, percentage: pct(contacted), color: "#3b82f6" },
    { stage: "Em Conversa", count: inConversation, percentage: pct(inConversation), color: "#6366f1" },
    { stage: "Handoff", count: handoff, percentage: pct(handoff), color: "#059669" },
  ]
}

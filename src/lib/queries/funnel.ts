import { createClient } from "@/lib/supabase/server"
import type { DateRange } from "@/lib/types/database"
import { throwQueryError } from "@/lib/queries/errors"

export interface FunnelStage {
  stage: string
  count: number
  percentage: number
  color: string
}

export interface FunnelConversion {
  label: string
  rate: number
  color: string
}

export interface FunnelData {
  summary: FunnelStage[]
  chart: FunnelStage[]
  conversions: FunnelConversion[]
}

export async function getFunnelData(period?: DateRange): Promise<FunnelData> {
  const supabase = await createClient()

  let query = supabase
    .from("fb_leads")
    .select("path, status, cnpj_valido")

  if (period) {
    query = query.gte("created_at", period.from).lte("created_at", period.to)
  }

  const { data, error } = await query
  throwQueryError("Falha ao carregar dados do funil", error)
  const rows = data ?? []
  const total = rows.length

  if (total === 0) {
    return { summary: [], chart: [], conversions: [] }
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
  const rate = (next: number, base: number) =>
    base > 0 ? Math.round((next / base) * 100 * 10) / 10 : 0

  const summary: FunnelStage[] = [
    { stage: "Formulários", count: total, percentage: 100, color: "#6366f1" },
    { stage: "CNPJ Válido", count: cnpjValid, percentage: pct(cnpjValid), color: "#8b5cf6" },
    { stage: "Distribuidor (P2)", count: path2, percentage: pct(path2), color: "#f59e0b" },
    { stage: "Qualificado (P3)", count: path3, percentage: pct(path3), color: "#10b981" },
    { stage: "Contatado", count: contacted, percentage: pct(contacted), color: "#3b82f6" },
    { stage: "Em Conversa", count: inConversation, percentage: pct(inConversation), color: "#6366f1" },
    { stage: "Handoff", count: handoff, percentage: pct(handoff), color: "#059669" },
  ]

  const chart: FunnelStage[] = [
    summary[0],
    summary[1],
    summary[3],
    summary[4],
    summary[5],
    summary[6],
  ]

  const conversions: FunnelConversion[] = [
    { label: "Formulários → CNPJ Válido", rate: rate(cnpjValid, total), color: "#8b5cf6" },
    { label: "CNPJ Válido → Qualificado (P3)", rate: rate(path3, cnpjValid), color: "#10b981" },
    { label: "Qualificado (P3) → Contatado", rate: rate(contacted, path3), color: "#3b82f6" },
    { label: "Contatado → Em Conversa", rate: rate(inConversation, contacted), color: "#6366f1" },
    { label: "Em Conversa → Handoff", rate: rate(handoff, inConversation), color: "#059669" },
  ]

  return { summary, chart, conversions }
}

import { createClient } from "@/lib/supabase/server"
import type { DateRange } from "@/lib/types/database"
import { throwQueryError } from "@/lib/queries/errors"

export interface FunnelStage {
  stage: string
  count: number
  percentage: number
  color: string
  fromPreviousRate?: number
}

export interface FunnelConversion {
  label: string
  rate: number
  color: string
  base: number
  next: number
  drop: number
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
  const path3Rows = rows.filter((r) => r.path === 3)
  const contacted = path3Rows.filter((r) =>
    ["contacted", "in_conversation", "handoff_done"].includes(r.status)
  ).length
  const inConversation = path3Rows.filter((r) =>
    ["in_conversation", "handoff_done"].includes(r.status)
  ).length
  const handoff = path3Rows.filter((r) => r.status === "handoff_done").length

  const pct = (v: number) => Math.round((v / total) * 100 * 10) / 10
  const rate = (next: number, base: number) =>
    base > 0 ? Math.round((next / base) * 100 * 10) / 10 : 0

  const COLORS = {
    form: "#B2121A",
    valid: "#D97706",
    path2: "#D97706",
    path3: "#059669",
    contacted: "#2563EB",
    conversation: "#4F46E5",
    handoff: "#B2121A",
  } as const

  const summary: FunnelStage[] = [
    {
      stage: "Formulários",
      count: total,
      percentage: 100,
      color: COLORS.form,
      fromPreviousRate: 100,
    },
    {
      stage: "CNPJ Válido",
      count: cnpjValid,
      percentage: pct(cnpjValid),
      color: COLORS.valid,
      fromPreviousRate: rate(cnpjValid, total),
    },
    {
      stage: "Distribuidor (P2)",
      count: path2,
      percentage: pct(path2),
      color: COLORS.path2,
      fromPreviousRate: rate(path2, cnpjValid),
    },
    {
      stage: "Qualificado (P3)",
      count: path3,
      percentage: pct(path3),
      color: COLORS.path3,
      fromPreviousRate: rate(path3, cnpjValid),
    },
    {
      stage: "Contatado",
      count: contacted,
      percentage: pct(contacted),
      color: COLORS.contacted,
      fromPreviousRate: rate(contacted, path3),
    },
    {
      stage: "Em Conversa",
      count: inConversation,
      percentage: pct(inConversation),
      color: COLORS.conversation,
      fromPreviousRate: rate(inConversation, contacted),
    },
    {
      stage: "Handoff",
      count: handoff,
      percentage: pct(handoff),
      color: COLORS.handoff,
      fromPreviousRate: rate(handoff, inConversation),
    },
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
    {
      label: "Formulários → CNPJ Válido",
      rate: rate(cnpjValid, total),
      color: COLORS.valid,
      base: total,
      next: cnpjValid,
      drop: total - cnpjValid,
    },
    {
      label: "CNPJ Válido → Qualificado (P3)",
      rate: rate(path3, cnpjValid),
      color: COLORS.path3,
      base: cnpjValid,
      next: path3,
      drop: cnpjValid - path3,
    },
    {
      label: "Qualificado (P3) → Contatado",
      rate: rate(contacted, path3),
      color: COLORS.contacted,
      base: path3,
      next: contacted,
      drop: path3 - contacted,
    },
    {
      label: "Contatado → Em Conversa",
      rate: rate(inConversation, contacted),
      color: COLORS.conversation,
      base: contacted,
      next: inConversation,
      drop: contacted - inConversation,
    },
    {
      label: "Em Conversa → Handoff",
      rate: rate(handoff, inConversation),
      color: COLORS.handoff,
      base: inConversation,
      next: handoff,
      drop: inConversation - handoff,
    },
  ]

  return { summary, chart, conversions }
}

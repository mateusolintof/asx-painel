import { createClient } from "@/lib/supabase/server"
import type { DateRange, KPI } from "@/lib/types/database"
import { calcDelta } from "@/lib/utils/format"

export async function getKPIs(current: DateRange, previous: DateRange): Promise<KPI[]> {
  const supabase = await createClient()

  const [currentData, previousData] = await Promise.all([
    getPeriodStats(current),
    getPeriodStats(previous),
  ])

  return [
    {
      label: "Total Leads",
      value: currentData.total,
      previousValue: previousData.total,
      format: "number",
    },
    {
      label: "Qualificados (P3)",
      value: currentData.qualified,
      previousValue: previousData.qualified,
      format: "number",
    },
    {
      label: "Taxa de Handoff",
      value: currentData.total > 0
        ? (currentData.handoff / currentData.total) * 100
        : 0,
      previousValue: previousData.total > 0
        ? (previousData.handoff / previousData.total) * 100
        : 0,
      format: "percent",
    },
    {
      label: "Score M\u00e9dio",
      value: currentData.avgScore,
      previousValue: previousData.avgScore,
      format: "number",
    },
  ]
}

async function getPeriodStats(period: DateRange) {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from("fb_leads")
    .select("path, status")
    .gte("created_at", period.from)
    .lte("created_at", period.to)

  const { data: qualifiedLeads } = await supabase
    .from("leads")
    .select("score")
    .gte("qualified_at", period.from)
    .lte("qualified_at", period.to)

  const rows = leads ?? []
  const scored = qualifiedLeads ?? []

  return {
    total: rows.length,
    qualified: rows.filter((r) => r.path === 3).length,
    handoff: rows.filter((r) => r.status === "handoff_done").length,
    avgScore: scored.length > 0
      ? Math.round(scored.reduce((sum, l) => sum + (l.score ?? 0), 0) / scored.length)
      : 0,
  }
}

export async function getTrendData(days: number = 30) {
  const supabase = await createClient()
  const from = new Date()
  from.setDate(from.getDate() - days)

  const { data } = await supabase
    .from("v_funnel_summary")
    .select("*")
    .gte("day", from.toISOString().split("T")[0])
    .order("day", { ascending: true })

  return data ?? []
}

export async function getPathDistribution(period?: DateRange) {
  const supabase = await createClient()

  let query = supabase
    .from("fb_leads")
    .select("path")

  if (period) {
    query = query.gte("created_at", period.from).lte("created_at", period.to)
  }

  const { data } = await query

  const rows = data ?? []
  return [
    { name: "Desqualificado", value: rows.filter((r) => r.path === 1).length, fill: "#ef4444" },
    { name: "Distribuidor", value: rows.filter((r) => r.path === 2).length, fill: "#f59e0b" },
    { name: "Qualificado", value: rows.filter((r) => r.path === 3).length, fill: "#10b981" },
  ]
}

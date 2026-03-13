import { createClient } from "@/lib/supabase/server"
import type { DateRange, KPI } from "@/lib/types/database"
import { throwQueryError } from "@/lib/queries/errors"

export async function getKPIs(current: DateRange, previous: DateRange): Promise<KPI[]> {
  const [currentData, previousData] = await Promise.all([
    getPeriodStats(current),
    getPeriodStats(previous),
  ])

  return [
    {
      label: "Entradas",
      value: currentData.total,
      previousValue: previousData.total,
      format: "number",
    },
    {
      label: "Atendimento interno",
      value: currentData.qualified,
      previousValue: previousData.qualified,
      format: "number",
    },
    {
      label: "Taxa de transferencia",
      value: currentData.total > 0
        ? (currentData.handoff / currentData.total) * 100
        : 0,
      previousValue: previousData.total > 0
        ? (previousData.handoff / previousData.total) * 100
        : 0,
      format: "percent",
    },
    {
      label: "Pontuacao media",
      value: currentData.avgScore,
      previousValue: previousData.avgScore,
      format: "number",
    },
  ]
}

async function getPeriodStats(period: DateRange) {
  const supabase = await createClient()

  const { data: leads, error: leadsErr } = await supabase
    .from("fb_leads")
    .select("path, status")
    .gte("created_at", period.from)
    .lte("created_at", period.to)

  throwQueryError("Falha ao carregar KPIs de leads", leadsErr)

  const { data: qualifiedLeads, error: qualifiedErr } = await supabase
    .from("leads")
    .select("score")
    .gte("qualified_at", period.from)
    .lte("qualified_at", period.to)

  throwQueryError("Falha ao carregar scores para KPIs", qualifiedErr)

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

export async function getTrendData(period?: DateRange) {
  const supabase = await createClient()

  const fromDay = period
    ? period.from.split("T")[0]
    : (() => {
        const from = new Date()
        from.setDate(from.getDate() - 30)
        return from.toISOString().split("T")[0]
      })()

  const toDay = period
    ? period.to.split("T")[0]
    : new Date().toISOString().split("T")[0]

  let query = supabase
    .from("v_funnel_summary")
    .select("*")
    .order("day", { ascending: true })

  query = query.gte("day", fromDay).lte("day", toDay)

  const { data, error } = await query

  throwQueryError("Falha ao carregar tendencia do funil", error)
  const rows = data ?? []
  const rowsByDay = new Map(rows.map((row) => [row.day, row]))

  return buildDayRange(fromDay, toDay).map((day) => {
    const existing = rowsByDay.get(day)
    if (existing) return existing

    return {
      day,
      total_leads: 0,
      path1_disqualified: 0,
      path2_distributor: 0,
      path3_qualified: 0,
      contacted: 0,
      in_conversation: 0,
      handoff_done: 0,
      disqualified_cnpj: 0,
      disqualified_policy: 0,
      send_failed: 0,
    }
  })
}

export async function getPathDistribution(period?: DateRange) {
  const supabase = await createClient()

  let query = supabase
    .from("fb_leads")
    .select("path")

  if (period) {
    query = query.gte("created_at", period.from).lte("created_at", period.to)
  }

  const { data, error } = await query

  throwQueryError("Falha ao carregar destinos dos leads", error)

  const rows = data ?? []
  return [
    { name: "Fora do perfil", value: rows.filter((r) => r.path === 1).length, fill: "#ef4444" },
    { name: "Encaminhado a parceiro", value: rows.filter((r) => r.path === 2).length, fill: "#f59e0b" },
    { name: "Atendimento interno", value: rows.filter((r) => r.path === 3).length, fill: "#10b981" },
  ]
}

function buildDayRange(fromDay: string, toDay: string) {
  const days: string[] = []
  const current = new Date(`${fromDay}T00:00:00Z`)
  const end = new Date(`${toDay}T00:00:00Z`)

  while (current <= end) {
    days.push(current.toISOString().split("T")[0])
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return days
}

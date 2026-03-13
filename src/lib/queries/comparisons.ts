import { createClient } from "@/lib/supabase/server"
import type { DateRange } from "@/lib/types/database"
import { throwQueryError } from "@/lib/queries/errors"

export interface ComparisonMetric {
  label: string
  periodA: number
  periodB: number
  delta: number
  format: "number" | "percent"
}

export async function comparePeriods(
  periodA: DateRange,
  periodB: DateRange
): Promise<ComparisonMetric[]> {
  const [statsA, statsB] = await Promise.all([
    getPeriodAggregates(periodA),
    getPeriodAggregates(periodB),
  ])

  const delta = (a: number, b: number) =>
    b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 1000) / 10

  return [
    {
      label: "Entradas",
      periodA: statsA.total,
      periodB: statsB.total,
      delta: delta(statsA.total, statsB.total),
      format: "number",
    },
    {
      label: "Atendimento interno",
      periodA: statsA.qualified,
      periodB: statsB.qualified,
      delta: delta(statsA.qualified, statsB.qualified),
      format: "number",
    },
    {
      label: "Transferidos ao vendedor",
      periodA: statsA.handoff,
      periodB: statsB.handoff,
      delta: delta(statsA.handoff, statsB.handoff),
      format: "number",
    },
    {
      label: "Taxa de transferencia",
      periodA: statsA.total > 0 ? Math.round((statsA.handoff / statsA.total) * 1000) / 10 : 0,
      periodB: statsB.total > 0 ? Math.round((statsB.handoff / statsB.total) * 1000) / 10 : 0,
      delta: delta(
        statsA.total > 0 ? statsA.handoff / statsA.total : 0,
        statsB.total > 0 ? statsB.handoff / statsB.total : 0
      ),
      format: "percent",
    },
    {
      label: "Pontuacao media",
      periodA: statsA.avgScore,
      periodB: statsB.avgScore,
      delta: delta(statsA.avgScore, statsB.avgScore),
      format: "number",
    },
    {
      label: "Fora do perfil",
      periodA: statsA.disqualified,
      periodB: statsB.disqualified,
      delta: delta(statsA.disqualified, statsB.disqualified),
      format: "number",
    },
  ]
}

async function getPeriodAggregates(period: DateRange) {
  const supabase = await createClient()

  const { data: leads, error: leadsErr } = await supabase
    .from("fb_leads")
    .select("path, status")
    .gte("created_at", period.from)
    .lte("created_at", period.to)

  throwQueryError("Falha ao carregar comparativo de leads", leadsErr)

  const { data: scored, error: scoresErr } = await supabase
    .from("leads")
    .select("score")
    .gte("qualified_at", period.from)
    .lte("qualified_at", period.to)

  throwQueryError("Falha ao carregar comparativo de scores", scoresErr)

  const rows = leads ?? []
  const scores = scored ?? []

  return {
    total: rows.length,
    qualified: rows.filter((r) => r.path === 3).length,
    handoff: rows.filter((r) => r.status === "handoff_done").length,
    disqualified: rows.filter((r) => r.path === 1).length,
    avgScore: scores.length > 0
      ? Math.round(scores.reduce((s, l) => s + (l.score ?? 0), 0) / scores.length)
      : 0,
  }
}

export async function getTrendComparison(periodA: DateRange, periodB: DateRange) {
  const supabase = await createClient()

  const [dataA, dataB] = await Promise.all([
    supabase
      .from("v_funnel_summary")
      .select("*")
      .gte("day", periodA.from)
      .lte("day", periodA.to)
      .order("day", { ascending: true }),
    supabase
      .from("v_funnel_summary")
      .select("*")
      .gte("day", periodB.from)
      .lte("day", periodB.to)
      .order("day", { ascending: true }),
  ])

  throwQueryError("Falha ao carregar tendencia do periodo A", dataA.error)
  throwQueryError("Falha ao carregar tendencia do periodo B", dataB.error)

  return {
    periodA: dataA.data ?? [],
    periodB: dataB.data ?? [],
  }
}

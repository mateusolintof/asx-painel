import { createClient } from "@/lib/supabase/server"

export interface SellerStats {
  id: number
  name: string
  phone: string
  totalLeads: number
  avgScore: number
  scoreDistribution: { class: string; count: number }[]
  latestAssignment: string | null
}

export async function getSellerPerformance(): Promise<SellerStats[]> {
  const supabase = await createClient()

  const { data: agents } = await supabase
    .from("agents")
    .select("*")

  if (!agents) return []

  const stats: SellerStats[] = []

  for (const agent of agents) {
    const { data: assignments } = await supabase
      .from("assignments")
      .select("lead_id, assigned_at")
      .eq("assignee_id", agent.id)
      .order("assigned_at", { ascending: false })

    const leadIds = (assignments ?? []).map((a) => a.lead_id)

    let leads: { score: number; class: string }[] = []
    if (leadIds.length > 0) {
      const { data } = await supabase
        .from("leads")
        .select("score, class")
        .in("id", leadIds)
      leads = data ?? []
    }

    const scoreDistribution = ["quente", "morno", "frio"].map((cls) => ({
      class: cls,
      count: leads.filter((l) => l.class === cls).length,
    }))

    stats.push({
      id: agent.id,
      name: agent.name,
      phone: agent.phone,
      totalLeads: leadIds.length,
      avgScore: leads.length > 0
        ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length)
        : 0,
      scoreDistribution,
      latestAssignment: assignments?.[0]?.assigned_at ?? null,
    })
  }

  return stats
}

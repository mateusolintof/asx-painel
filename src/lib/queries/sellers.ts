import { createClient } from "@/lib/supabase/server"
import { throwQueryError } from "@/lib/queries/errors"

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

  // 1. Buscar todos os agentes
  const { data: agents, error: agentErr } = await supabase
    .from("agents")
    .select("*")

  throwQueryError("Falha ao carregar vendedores", agentErr)
  if (!agents || agents.length === 0) return []

  // 2. Batch: buscar todas as assignments de uma vez
  const agentIds = agents.map((a) => a.id)
  const { data: allAssignments, error: assignmentsErr } = await supabase
    .from("assignments")
    .select("lead_id, assignee_id, assigned_at")
    .in("assignee_id", agentIds)
    .order("assigned_at", { ascending: false })

  throwQueryError("Falha ao carregar atribuicoes de vendedores", assignmentsErr)

  const assignments = allAssignments ?? []

  // 3. Batch: buscar todos os leads referenciados
  const leadIds = [...new Set(assignments.map((a) => a.lead_id))]
  const leadMap = new Map<string, { score: number; class: string }>()

  if (leadIds.length > 0) {
    const { data: leads, error: leadsErr } = await supabase
      .from("leads")
      .select("id, score, class")
      .in("id", leadIds)

    throwQueryError("Falha ao carregar leads dos vendedores", leadsErr)

    for (const l of leads ?? []) {
      leadMap.set(String(l.id), { score: l.score, class: l.class })
    }
  }

  // 4. Montar resultado por agente
  return agents.map((agent) => {
    const agentAssignments = assignments.filter((a) => a.assignee_id === agent.id)
    const agentLeads = agentAssignments
      .map((a) => leadMap.get(String(a.lead_id)))
      .filter((l): l is { score: number; class: string } => l != null)

    const scoreDistribution = ["quente", "morno", "frio"].map((cls) => ({
      class: cls,
      count: agentLeads.filter((l) => l.class === cls).length,
    }))

    return {
      id: agent.id,
      name: agent.name,
      phone: agent.phone,
      totalLeads: agentAssignments.length,
      avgScore: agentLeads.length > 0
        ? Math.round(agentLeads.reduce((s, l) => s + l.score, 0) / agentLeads.length)
        : 0,
      scoreDistribution,
      latestAssignment: agentAssignments[0]?.assigned_at ?? null,
    }
  })
}

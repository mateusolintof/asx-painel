import { createClient } from "@/lib/supabase/server"

export interface HotLead {
  fb_lead_id: string
  nome: string
  telefone: string
  empresa: string | null
  estado: string
  perfil: string
  volume_faixa: string
  status: string
  score: number | null
  class: string | null
  priority: string | null
  vendedor: string | null
  lead_created_at: string
  last_activity: string
  hours_waiting: number
}

export async function getHotLeads(): Promise<HotLead[]> {
  const supabase = await createClient()

  // Path 3 leads que estao parados (nao completaram handoff ou estao stale)
  const { data: fbLeads } = await supabase
    .from("fb_leads")
    .select("*")
    .eq("path", 3)
    .in("status", ["contacted", "in_conversation"])
    .order("created_at", { ascending: true })

  if (!fbLeads || fbLeads.length === 0) return []

  const results: HotLead[] = []

  for (const fl of fbLeads) {
    // Ultima mensagem
    const { data: lastMsg } = await supabase
      .from("ia_messages")
      .select("created_at")
      .eq("phone", fl.telefone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Lead qualificado (se ja foi scored)
    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("phone", fl.telefone)
      .maybeSingle()

    let qualifiedLead = null
    let seller = null

    if (contact) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id, score, class, priority")
        .eq("contact_id", contact.id)
        .maybeSingle()
      qualifiedLead = lead

      if (lead) {
        const { data: assignment } = await supabase
          .from("assignments")
          .select("assignee_id")
          .eq("lead_id", lead.id)
          .maybeSingle()

        if (assignment) {
          const { data: agent } = await supabase
            .from("agents")
            .select("name")
            .eq("id", assignment.assignee_id)
            .maybeSingle()
          seller = agent?.name ?? null
        }
      }
    }

    const lastActivity = lastMsg?.created_at ?? fl.created_at
    const hoursWaiting = Math.round(
      (Date.now() - new Date(lastActivity).getTime()) / 3600000
    )

    results.push({
      fb_lead_id: fl.id,
      nome: fl.nome,
      telefone: fl.telefone,
      empresa: fl.nome_fantasia ?? fl.razao_social,
      estado: fl.estado_envio,
      perfil: fl.perfil,
      volume_faixa: fl.volume_faixa,
      status: fl.status,
      score: qualifiedLead?.score ?? null,
      class: qualifiedLead?.class ?? null,
      priority: qualifiedLead?.priority ?? null,
      vendedor: seller,
      lead_created_at: fl.created_at,
      last_activity: lastActivity,
      hours_waiting: hoursWaiting,
    })
  }

  // Sort: priority (urgent > high > medium), then by hours_waiting desc
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2 }
  results.sort((a, b) => {
    const pa = priorityOrder[a.priority ?? "medium"] ?? 3
    const pb = priorityOrder[b.priority ?? "medium"] ?? 3
    if (pa !== pb) return pa - pb
    return b.hours_waiting - a.hours_waiting
  })

  return results
}

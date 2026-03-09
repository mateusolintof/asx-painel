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

  // 1. Buscar todos os fb_leads Path 3 parados
  const { data: fbLeads, error: fbErr } = await supabase
    .from("fb_leads")
    .select("*")
    .eq("path", 3)
    .in("status", ["contacted", "in_conversation"])
    .order("created_at", { ascending: true })

  if (fbErr) throw new Error(`Failed to fetch hot leads: ${fbErr.message}`)
  if (!fbLeads || fbLeads.length === 0) return []

  const phones = fbLeads.map((fl) => fl.telefone)

  // 2. Batch: buscar todos os contatos por telefone
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, phone")
    .in("phone", phones)

  const contactMap = new Map(
    (contacts ?? []).map((c) => [c.phone, c.id])
  )

  // 3. Batch: buscar todos os leads qualificados por contact_id
  const contactIds = [...contactMap.values()]
  let leadMap = new Map<string, { id: string; score: number; class: string; priority: string }>()

  if (contactIds.length > 0) {
    const { data: leads } = await supabase
      .from("leads")
      .select("id, contact_id, score, class, priority")
      .in("contact_id", contactIds)

    for (const lead of leads ?? []) {
      leadMap.set(String(lead.contact_id), lead)
    }
  }

  // 4. Batch: buscar todas as assignments por lead_id
  const leadIds = [...leadMap.values()].map((l) => l.id)
  let assignmentMap = new Map<string, string>()

  if (leadIds.length > 0) {
    const { data: assignments } = await supabase
      .from("assignments")
      .select("lead_id, assignee_id")
      .in("lead_id", leadIds)

    for (const a of assignments ?? []) {
      assignmentMap.set(String(a.lead_id), String(a.assignee_id))
    }
  }

  // 5. Batch: buscar todos os agentes
  const agentIds = [...new Set(assignmentMap.values())]
  let agentMap = new Map<string, string>()

  if (agentIds.length > 0) {
    const { data: agents } = await supabase
      .from("agents")
      .select("id, name")
      .in("id", agentIds)

    for (const ag of agents ?? []) {
      agentMap.set(String(ag.id), ag.name)
    }
  }

  // 6. Batch: buscar ultima mensagem por telefone
  const { data: allMessages } = await supabase
    .from("ia_messages")
    .select("phone, created_at")
    .in("phone", phones)
    .order("created_at", { ascending: false })

  const lastMsgMap = new Map<string, string>()
  for (const msg of allMessages ?? []) {
    if (!lastMsgMap.has(msg.phone)) {
      lastMsgMap.set(msg.phone, msg.created_at)
    }
  }

  // 7. Montar resultado
  const results: HotLead[] = fbLeads.map((fl) => {
    const contactId = contactMap.get(fl.telefone)
    const qualifiedLead = contactId ? leadMap.get(String(contactId)) : null
    const assigneeId = qualifiedLead ? assignmentMap.get(String(qualifiedLead.id)) : null
    const vendedor = assigneeId ? agentMap.get(assigneeId) ?? null : null
    const lastActivity = lastMsgMap.get(fl.telefone) ?? fl.created_at
    const hoursWaiting = Math.round(
      (Date.now() - new Date(lastActivity).getTime()) / 3600000
    )

    return {
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
      vendedor,
      lead_created_at: fl.created_at,
      last_activity: lastActivity,
      hours_waiting: hoursWaiting,
    }
  })

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

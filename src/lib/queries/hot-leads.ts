import { createClient } from "@/lib/supabase/server"
import { throwQueryError } from "@/lib/queries/errors"

export interface HotLead {
  fb_lead_id: string
  lead_id: string | null
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
  assigned_at: string | null
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

  throwQueryError("Falha ao carregar leads quentes", fbErr)
  if (!fbLeads || fbLeads.length === 0) return []

  const phones = fbLeads.map((fl) => fl.telefone)

  // 2. Batch: buscar todos os contatos por telefone
  const { data: contacts, error: contactsErr } = await supabase
    .from("contacts")
    .select("id, phone")
    .in("phone", phones)

  throwQueryError("Falha ao carregar contatos dos leads quentes", contactsErr)

  const contactMap = new Map(
    (contacts ?? []).map((c) => [c.phone, c.id])
  )

  // 3. Batch: buscar todos os leads qualificados por contact_id
  const contactIds = [...contactMap.values()]
  const leadMap = new Map<string, { id: string; score: number; class: string; priority: string }>()

  if (contactIds.length > 0) {
    const { data: leads, error: leadsErr } = await supabase
      .from("leads")
      .select("id, contact_id, score, class, priority")
      .in("contact_id", contactIds)

    throwQueryError("Falha ao carregar qualificacao dos leads quentes", leadsErr)

    for (const lead of leads ?? []) {
      leadMap.set(String(lead.contact_id), lead)
    }
  }

  // 4. Batch: buscar todas as assignments por lead_id
  const leadIds = [...leadMap.values()].map((l) => l.id)
  const assignmentMap = new Map<
    string,
    { assigneeId: string; assignedAt: string | null }
  >()

  if (leadIds.length > 0) {
    const { data: assignments, error: assignmentsErr } = await supabase
      .from("assignments")
      .select("lead_id, assignee_id, assigned_at")
      .in("lead_id", leadIds)
      .order("assigned_at", { ascending: false })

    throwQueryError("Falha ao carregar atribuicoes dos leads quentes", assignmentsErr)

    for (const a of assignments ?? []) {
      if (assignmentMap.has(String(a.lead_id))) continue
      assignmentMap.set(String(a.lead_id), {
        assigneeId: String(a.assignee_id),
        assignedAt: a.assigned_at,
      })
    }
  }

  // 5. Batch: buscar todos os agentes
  const agentIds = [
    ...new Set([...assignmentMap.values()].map((assignment) => assignment.assigneeId)),
  ]
  const agentMap = new Map<string, string>()

  if (agentIds.length > 0) {
    const { data: agents, error: agentsErr } = await supabase
      .from("agents")
      .select("id, name")
      .in("id", agentIds)

    throwQueryError("Falha ao carregar vendedores dos leads quentes", agentsErr)

    for (const ag of agents ?? []) {
      agentMap.set(String(ag.id), ag.name)
    }
  }

  // 6. Batch: buscar ultima mensagem por telefone
  const { data: allMessages, error: messagesErr } = await supabase
    .from("ia_messages")
    .select("phone, created_at")
    .in("phone", phones)
    .order("created_at", { ascending: false })

  throwQueryError("Falha ao carregar mensagens dos leads quentes", messagesErr)

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
    const assignment = qualifiedLead
      ? assignmentMap.get(String(qualifiedLead.id)) ?? null
      : null
    const vendedor = assignment ? agentMap.get(assignment.assigneeId) ?? null : null
    const lastActivity = lastMsgMap.get(fl.telefone) ?? fl.created_at
    const hoursWaiting = Math.round(
      (Date.now() - new Date(lastActivity).getTime()) / 3600000
    )

    return {
      fb_lead_id: fl.id,
      lead_id: qualifiedLead?.id ?? null,
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
      assigned_at: assignment?.assignedAt ?? null,
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

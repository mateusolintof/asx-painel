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

type HotLeadBaseRecord = {
  id: string
  telefone: string
  nome: string
  nome_fantasia: string | null
  razao_social: string | null
  estado_envio: string
  perfil: string
  volume_faixa: string
  status: string
  created_at: string
}

export async function getHotLeads(): Promise<HotLead[]> {
  const supabase = await createClient()

  // 1. Buscar apenas os leads realmente classificados como quentes.
  const { data: qualifiedLeads, error: leadsErr } = await supabase
    .from("leads")
    .select("id, contact_id, score, class, priority")
    .eq("class", "quente")

  throwQueryError("Falha ao carregar leads quentes", leadsErr)
  if (!qualifiedLeads || qualifiedLeads.length === 0) return []

  const contactIds = qualifiedLeads
    .map((lead) => lead.contact_id)
    .filter((contactId): contactId is string => Boolean(contactId))

  if (contactIds.length === 0) return []

  // 2. Buscar os contatos dos leads quentes para obter o telefone.
  const { data: contacts, error: contactsErr } = await supabase
    .from("contacts")
    .select("id, phone")
    .in("id", contactIds)

  throwQueryError("Falha ao carregar contatos dos leads quentes", contactsErr)

  const contactMap = new Map(
    (contacts ?? []).map((contact) => [String(contact.id), contact])
  )
  const phones = [...new Set((contacts ?? []).map((contact) => contact.phone))]

  if (phones.length === 0) return []

  // 3. Buscar o fb_lead mais recente do Path 3 por telefone.
  const { data: fbLeads, error: fbErr } = await supabase
    .from("fb_leads")
    .select(
      "id, telefone, nome, nome_fantasia, razao_social, estado_envio, perfil, volume_faixa, status, created_at"
    )
    .eq("path", 3)
    .in("telefone", phones)
    .order("created_at", { ascending: false })

  throwQueryError("Falha ao carregar lead base dos leads quentes", fbErr)

  const fbLeadMap = new Map<string, HotLeadBaseRecord>()
  for (const fbLead of fbLeads ?? []) {
    if (!fbLeadMap.has(fbLead.telefone)) {
      fbLeadMap.set(fbLead.telefone, fbLead)
    }
  }

  // 4. Batch: buscar todas as assignments por lead_id
  const leadIds = qualifiedLeads.map((lead) => lead.id)
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
  const results = qualifiedLeads
    .map((qualifiedLead) => {
      const contact = contactMap.get(String(qualifiedLead.contact_id))
      const phone = contact?.phone ?? null
      const fbLead = phone ? fbLeadMap.get(phone) ?? null : null

      if (!phone || !fbLead) return null

      const assignment = assignmentMap.get(String(qualifiedLead.id)) ?? null
      const vendedor = assignment
        ? agentMap.get(assignment.assigneeId) ?? null
        : null
      const lastActivity =
        lastMsgMap.get(phone) ??
        assignment?.assignedAt ??
        fbLead.created_at
      const hoursWaiting = Math.round(
        (Date.now() - new Date(lastActivity).getTime()) / 3600000
      )

      return {
        fb_lead_id: fbLead.id,
        lead_id: qualifiedLead.id,
        nome: fbLead.nome,
        telefone: phone,
        empresa: fbLead.nome_fantasia ?? fbLead.razao_social,
        estado: fbLead.estado_envio,
        perfil: fbLead.perfil,
        volume_faixa: fbLead.volume_faixa,
        status: fbLead.status,
        score: qualifiedLead.score ?? null,
        class: qualifiedLead.class ?? null,
        priority: qualifiedLead.priority ?? null,
        vendedor,
        assigned_at: assignment?.assignedAt ?? null,
        lead_created_at: fbLead.created_at,
        last_activity: lastActivity,
        hours_waiting: hoursWaiting,
      }
    })
    .filter((lead): lead is HotLead => lead !== null)

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

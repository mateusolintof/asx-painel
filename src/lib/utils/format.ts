export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "")
  if (clean.length === 13) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  }
  return phone
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "")
  if (clean.length !== 14) return cnpj
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "agora"
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return formatDate(dateStr)
}

export function calcDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatLeadRoutingReason(reason: string | null): string {
  if (!reason) return "Sem observacao"

  const normalized = reason.toLowerCase()

  if (normalized.includes("qualificado")) {
    return "Seguiu para atendimento interno"
  }

  if (
    normalized.includes("distribuidor") ||
    normalized.includes("volume <") ||
    normalized.includes("volume abaixo")
  ) {
    return "Encaminhado a parceiro regional"
  }

  if (normalized.includes("cnpj")) {
    return "Fora do perfil por CNPJ"
  }

  if (normalized.includes("politica")) {
    return "Fora do perfil por politica interna"
  }

  return reason
}

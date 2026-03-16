export const PATH_LABELS: Record<number, string> = {
  1: "Fora do perfil",
  2: "Rede parceira",
  3: "Operacao ASX",
}

export const PATH_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-amber-100 text-amber-800 border-amber-200",
  3: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando contato",
  contacted: "Primeiro contato feito",
  in_conversation: "Em atendimento",
  handoff_done: "Com vendedor",
  disqualified_cnpj: "CNPJ inválido",
  disqualified_policy: "Política interna",
  send_failed: "Falha no envio",
}

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  in_conversation: "bg-indigo-100 text-indigo-800 border-indigo-200",
  handoff_done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  disqualified_cnpj: "bg-red-100 text-red-800 border-red-200",
  disqualified_policy: "bg-orange-100 text-orange-800 border-orange-200",
  send_failed: "bg-red-100 text-red-800 border-red-200",
}

export const SCORE_LABELS: Record<string, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
}

export const SCORE_COLORS: Record<string, string> = {
  quente: "bg-red-100 text-red-800 border-red-200",
  morno: "bg-yellow-100 text-yellow-800 border-yellow-200",
  frio: "bg-blue-100 text-blue-800 border-blue-200",
}

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Média",
}

export const NNE_STATES = [
  "AC", "AM", "AP", "PA", "RO", "RR", "TO",
  "AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE",
]

export const VOLUME_MAP: Record<string, number> = {
  "Abaixo de 2.000": 1500,
  "Entre 2.000 e 4.000": 3000,
  "Entre 4.000 e 10.000": 7000,
  "Acima de 10.000": 12000,
}

export const SELLERS = [
  { id: 2, name: "Queila", phone: "5575991803083", team_id: 1 },
  { id: 3, name: "Tiago", phone: "5575999216589", team_id: 2 },
]

export const NAV_ITEMS = [
  { label: "Resumo Executivo", href: "/", icon: "LayoutDashboard" },
  { label: "Leads", href: "/leads", icon: "Users" },
  { label: "Jornada Comercial", href: "/funil", icon: "Filter" },
  { label: "Equipe Comercial", href: "/vendedores", icon: "UserCheck" },
  { label: "Rede Parceira", href: "/distribuidores", icon: "Building2" },
  { label: "Comparativo de Periodos", href: "/comparativos", icon: "BarChart3" },
  { label: "Prioridades Comerciais", href: "/leads-quentes", icon: "Flame" },
] as const

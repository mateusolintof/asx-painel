import { createClient } from "@/lib/supabase/server"

export interface DistributorStats {
  id: number
  razao_social: string
  cidade: string
  estado_uf: string
  tipo: string
  timesRecommended: number
  lastRecommendedAt: string | null
}

export async function getDistributorStats(estado?: string) {
  const supabase = await createClient()

  // Total Path 2 redirections
  const { count: totalRedirections } = await supabase
    .from("fb_leads")
    .select("*", { count: "exact", head: true })
    .eq("path", 2)

  // Get all recommendations with distributor data
  let recQuery = supabase
    .from("distributor_recommendations")
    .select("distributor_id, recommended_at, distributors(id, razao_social, cidade, estado_uf, tipo_representantes)")

  const { data: recommendations } = await recQuery

  // Aggregate by distributor
  const distributorMap = new Map<number, DistributorStats>()

  for (const rec of recommendations ?? []) {
    const dist = rec.distributors as unknown as {
      id: number
      razao_social: string
      cidade: string
      estado_uf: string
      tipo_representantes: string
    }
    if (!dist) continue

    if (estado && dist.estado_uf !== estado) continue

    const existing = distributorMap.get(dist.id)
    if (existing) {
      existing.timesRecommended++
      if (rec.recommended_at > (existing.lastRecommendedAt ?? "")) {
        existing.lastRecommendedAt = rec.recommended_at
      }
    } else {
      distributorMap.set(dist.id, {
        id: dist.id,
        razao_social: dist.razao_social,
        cidade: dist.cidade,
        estado_uf: dist.estado_uf,
        tipo: dist.tipo_representantes,
        timesRecommended: 1,
        lastRecommendedAt: rec.recommended_at,
      })
    }
  }

  const distributors = Array.from(distributorMap.values())
    .sort((a, b) => b.timesRecommended - a.timesRecommended)

  // Unique distributors
  const uniqueDistributors = distributors.length

  // Available states for filter
  const { data: states } = await supabase
    .from("distributors")
    .select("estado_uf")
    .eq("status", "ATIVADO")

  const uniqueStates = [...new Set((states ?? []).map((s) => s.estado_uf))].sort()

  return {
    totalRedirections: totalRedirections ?? 0,
    uniqueDistributors,
    distributors,
    availableStates: uniqueStates,
  }
}

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSellerPerformance } from "@/lib/queries/sellers"
import { formatNumber, formatRelativeTime } from "@/lib/utils/format"
import { SCORE_COLORS, SCORE_LABELS } from "@/lib/utils/constants"
import { UserCheck } from "lucide-react"

export default async function VendedoresPage() {
  const sellers = await getSellerPerformance()

  return (
    <div className="space-y-8">
      {/* Seller Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {sellers.map((seller) => (
          <Card key={seller.id} className="border bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B2121A]/10">
                  <UserCheck className="h-5 w-5 text-[#B2121A]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111827]">{seller.name}</h3>
                  <p className="text-sm text-[#6B7280]">{seller.phone}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#6B7280]">Total Leads</p>
                <p className="mt-1 text-2xl font-semibold text-[#111827]">
                  {formatNumber(seller.totalLeads)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Score Médio</p>
                <p className="mt-1 text-2xl font-semibold text-[#111827]">
                  {seller.avgScore}
                </p>
              </div>
            </div>

            {/* Score Distribution Bar */}
            <div className="mt-4">
              <p className="mb-2 text-xs text-[#6B7280]">Distribuição por Score</p>
              {seller.totalLeads > 0 ? (
                <div className="flex h-3 overflow-hidden rounded-full">
                  {seller.scoreDistribution.map((sd) => {
                    const pct =
                      seller.totalLeads > 0
                        ? (sd.count / seller.totalLeads) * 100
                        : 0
                    if (pct === 0) return null
                    const colors: Record<string, string> = {
                      quente: "#B2121A",
                      morno: "#D97706",
                      frio: "#2563EB",
                    }
                    return (
                      <div
                        key={sd.class}
                        className="transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: colors[sd.class] ?? "#6B7280",
                        }}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="h-3 rounded-full bg-[#F3F4F6]" />
              )}
              <div className="mt-2 flex gap-3">
                {seller.scoreDistribution.map((sd) => (
                  <div key={sd.class} className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Badge
                      variant="outline"
                      className={SCORE_COLORS[sd.class]}
                    >
                      {SCORE_LABELS[sd.class]}: {sd.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {seller.latestAssignment && (
              <p className="mt-4 text-xs text-[#9CA3AF]">
                Último lead: {formatRelativeTime(seller.latestAssignment)}
              </p>
            )}
          </Card>
        ))}
      </div>

      {sellers.length === 0 && (
        <Card className="border bg-white p-8">
          <p className="text-center text-sm text-[#6B7280]">
            Nenhum vendedor encontrado
          </p>
        </Card>
      )}
    </div>
  )
}

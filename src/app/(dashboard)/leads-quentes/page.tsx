import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getHotLeads } from "@/lib/queries/hot-leads"
import { formatRelativeTime } from "@/lib/utils/format"
import { PRIORITY_LABELS } from "@/lib/utils/constants"
import { Flame, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function LeadsQuentesPage() {
  const hotLeads = await getHotLeads()

  const urgent = hotLeads.filter((l) => l.priority === "urgent")
  const stale = hotLeads.filter((l) => l.hours_waiting > 24)

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {stale.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-[#B2121A]" />
          <p className="text-sm font-medium text-[#B2121A]">
            {stale.length} lead{stale.length > 1 ? "s" : ""} sem atividade h\u00e1
            mais de 24h
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-[#B2121A] bg-white p-5">
          <p className="text-sm text-[#6B7280]">Total Pendentes</p>
          <p className="mt-1 text-2xl font-semibold text-[#111827]">
            {hotLeads.length}
          </p>
        </Card>
        <Card className="border-l-4 border-l-[#EF4444] bg-white p-5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#EF4444]" />
            <p className="text-sm text-[#6B7280]">Urgentes</p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-[#111827]">
            {urgent.length}
          </p>
        </Card>
        <Card className="border-l-4 border-l-[#D97706] bg-white p-5">
          <p className="text-sm text-[#6B7280]">Parados (&gt;24h)</p>
          <p className="mt-1 text-2xl font-semibold text-[#111827]">
            {stale.length}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-white p-6">
        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Prioridade
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Nome
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Empresa
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  UF
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Score
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Esperando
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-[#6B7280]"
                  >
                    Nenhum lead quente pendente
                  </TableCell>
                </TableRow>
              ) : (
                hotLeads.map((lead) => {
                  const priorityColors: Record<string, string> = {
                    urgent: "bg-red-100 text-red-800 border-red-200",
                    high: "bg-orange-100 text-orange-800 border-orange-200",
                    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  }
                  return (
                    <TableRow
                      key={lead.fb_lead_id}
                      className={`transition-colors hover:bg-[#FAFAFA] ${
                        lead.hours_waiting > 24 ? "bg-red-50/50" : ""
                      }`}
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            priorityColors[lead.priority ?? "medium"] ??
                            priorityColors.medium
                          }
                        >
                          {PRIORITY_LABELS[lead.priority ?? "medium"]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/leads/${lead.fb_lead_id}`}
                          className="text-sm font-medium text-[#111827] hover:text-[#B2121A]"
                        >
                          {lead.nome}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {lead.empresa ?? "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {lead.estado}
                      </TableCell>
                      <TableCell>
                        {lead.class ? (
                          <ScoreBadge
                            scoreClass={lead.class}
                            score={lead.score ?? undefined}
                          />
                        ) : (
                          <span className="text-sm text-[#9CA3AF]">\u2014</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {formatRelativeTime(lead.last_activity)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

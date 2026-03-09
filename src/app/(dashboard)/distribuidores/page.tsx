import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDistributorStats } from "@/lib/queries/distributors"
import { formatNumber, formatDate } from "@/lib/utils/format"
import { Building2, Users, MapPin } from "lucide-react"

interface Props {
  searchParams: Promise<{ estado?: string }>
}

export default async function DistribuidoresPage({ searchParams }: Props) {
  const params = await searchParams
  const data = await getDistributorStats(params.estado)

  return (
    <div className="space-y-8">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="border-l-4 border-l-[#D97706] bg-white p-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#D97706]" />
            <div>
              <p className="text-sm text-[#6B7280]">Redirecionamentos (P2)</p>
              <p className="mt-1 text-2xl font-semibold text-[#111827]">
                {formatNumber(data.totalRedirections)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-[#059669] bg-white p-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[#059669]" />
            <div>
              <p className="text-sm text-[#6B7280]">Distribuidores Usados</p>
              <p className="mt-1 text-2xl font-semibold text-[#111827]">
                {formatNumber(data.uniqueDistributors)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-[#2563EB] bg-white p-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#2563EB]" />
            <div>
              <p className="text-sm text-[#6B7280]">Estados Cobertos</p>
              <p className="mt-1 text-2xl font-semibold text-[#111827]">
                {formatNumber(data.availableStates.length)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter + Table */}
      <Card className="border bg-white p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-medium text-[#111827]">
            Distribuidores Recomendados
          </h2>
          <form>
            <select
              name="estado"
              defaultValue={params.estado ?? ""}
              className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]"
              onChange={(e) => {
                const url = e.target.value
                  ? `?estado=${e.target.value}`
                  : "/distribuidores"
                window.location.href = url
              }}
            >
              <option value="">Todos os Estados</option>
              {data.availableStates.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </form>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Distribuidor
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Cidade
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  UF
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Tipo
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Recomenda\u00e7\u00f5es
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  \u00daltima
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.distributors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-[#6B7280]"
                  >
                    Nenhuma recomenda\u00e7\u00e3o registrada
                  </TableCell>
                </TableRow>
              ) : (
                data.distributors.map((dist) => (
                  <TableRow key={dist.id} className="hover:bg-[#FAFAFA]">
                    <TableCell className="text-sm font-medium text-[#111827]">
                      {dist.razao_social}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {dist.cidade}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {dist.estado_uf}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {dist.tipo}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-[#111827]">
                      {dist.timesRecommended}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {dist.lastRecommendedAt
                        ? formatDate(dist.lastRecommendedAt)
                        : "\u2014"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

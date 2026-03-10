"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PathBadge } from "./path-badge"
import { StatusBadge } from "./status-badge"
import { formatDate } from "@/lib/utils/format"
import type { FbLead } from "@/lib/types/database"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useCallback, useState } from "react"

interface LeadTableProps {
  leads: FbLead[]
  total: number
  page: number
  totalPages: number
}

export function LeadTable({ leads, total, page, totalPages }: LeadTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      if (key !== "page") params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            placeholder="Buscar por nome, telefone, CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", search)
            }}
            className="pl-9"
          />
        </div>
        <select
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]"
          value={searchParams.get("path") ?? ""}
          onChange={(e) => updateParam("path", e.target.value)}
        >
          <option value="">Todos os Paths</option>
          <option value="1">Path 1 - Desqualificado</option>
          <option value="2">Path 2 - Distribuidor</option>
          <option value="3">Path 3 - Qualificado</option>
        </select>
        <select
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="contacted">Contatado</option>
          <option value="in_conversation">Em conversa</option>
          <option value="handoff_done">Transferido</option>
          <option value="disqualified_cnpj">CNPJ inválido</option>
          <option value="disqualified_policy">Política interna</option>
          <option value="send_failed">Falha no envio</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
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
                Path
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                Data
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-[#6B7280]"
                >
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer transition-colors hover:bg-[#FAFAFA]"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <TableCell className="text-sm font-medium text-[#111827]">
                    {lead.nome}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {lead.nome_fantasia ?? lead.razao_social ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {lead.estado_envio}
                  </TableCell>
                  <TableCell>
                    <PathBadge path={lead.path} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {formatDate(lead.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#6B7280]">
        <span>
          {total} lead{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {page} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

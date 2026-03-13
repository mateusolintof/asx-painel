"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PathBadge } from "@/components/dashboard/path-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { FbLead } from "@/lib/types/database"
import {
  formatCNPJ,
  formatDate,
  formatLeadRoutingReason,
  formatPhone,
} from "@/lib/utils/format"
import { cn } from "@/lib/utils"

type SortField = "created_at" | "nome" | "status" | "path" | "estado_envio"

const STORAGE_KEY = "asx-leads-table-sizing-v2"
const SORT_FIELDS: Partial<Record<string, SortField>> = {
  lead: "nome",
  estado_envio: "estado_envio",
  path: "path",
  status: "status",
  created_at: "created_at",
}

interface LeadTableProps {
  leads: FbLead[]
  total: number
  page: number
  totalPages: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  selectedLeadId?: string
}

export function LeadTable({
  leads,
  total,
  page,
  totalPages,
  sortBy = "created_at",
  sortOrder = "desc",
  selectedLeadId,
}: LeadTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") ?? ""
  const currentPath = searchParams.get("path") ?? ""
  const currentStatus = searchParams.get("status") ?? ""
  const [search, setSearch] = useState(currentSearch)
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})

  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedSizing = window.localStorage.getItem(STORAGE_KEY)
    if (!storedSizing) return

    try {
      setColumnSizing(JSON.parse(storedSizing) as ColumnSizingState)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnSizing))
  }, [columnSizing])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (search === currentSearch) return

      const params = new URLSearchParams(searchParams.toString())

      if (!search) {
        params.delete("search")
      } else {
        params.set("search", search)
      }

      params.delete("page")

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search, currentSearch, pathname, router, searchParams])

  function updateParams(
    updates: Record<string, string | null | undefined>,
    resetPage = true
  ) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    if (resetPage) {
      params.delete("page")
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  function handleSort(field: SortField) {
    const nextOrder =
      sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : field === "created_at" ? "desc" : "asc"

    updateParams(
      {
        sortBy: field,
        sortOrder: nextOrder,
      },
      true
    )
  }

  function clearFilters() {
    setSearch("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("path")
    params.delete("status")
    params.delete("page")
    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  const columns: ColumnDef<FbLead>[] = [
    {
      id: "lead",
      accessorKey: "nome",
      size: 210,
      minSize: 180,
      header: "Lead",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-[#111827]">{row.original.nome}</p>
          <p className="text-xs text-[#6B7280]">
            {formatPhone(row.original.telefone)}
          </p>
        </div>
      ),
    },
    {
      id: "company",
      size: 230,
      minSize: 200,
      header: "Empresa",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm text-[#111827]">
            {row.original.nome_fantasia ??
              row.original.razao_social ??
              "Empresa nao identificada"}
          </p>
          <p className="text-xs text-[#6B7280]">
            {row.original.cnpj ? formatCNPJ(row.original.cnpj) : "CNPJ nao informado"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "estado_envio",
      size: 92,
      minSize: 76,
      header: "UF",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-[#4B5563]">
          {row.original.estado_envio}
        </span>
      ),
    },
    {
      id: "qualification",
      size: 140,
      minSize: 128,
      header: "Perfil",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="line-clamp-1 text-sm text-[#111827]">
            {row.original.perfil}
          </p>
          <p className="line-clamp-1 text-xs text-[#6B7280]">
            {row.original.volume_faixa}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "path",
      size: 176,
      minSize: 156,
      header: "Destino",
      cell: ({ row }) => <PathBadge path={row.original.path} />,
    },
    {
      accessorKey: "status",
      size: 124,
      minSize: 112,
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      size: 120,
      minSize: 108,
      header: "Criado",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-[#111827]">
            {formatDate(row.original.created_at)}
          </p>
          <p className="text-xs text-[#6B7280]">
            {formatLeadRoutingReason(row.original.path_reason)}
          </p>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: leads,
    columns,
    defaultColumn: {
      minSize: 96,
      size: 140,
    },
    columnResizeMode: "onChange",
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  })

  const hasFilters = Boolean(currentSearch || currentPath || currentStatus)
  const from = total === 0 ? 0 : (page - 1) * 20 + 1
  const to = total === 0 ? 0 : from + leads.length - 1

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] px-4 py-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              placeholder="Buscar por nome, telefone, CNPJ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl border-[#E5E7EB] bg-[#FCFCFB] pl-9 pr-9 text-sm"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#111827]"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <select
            className="h-10 rounded-xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 text-sm text-[#111827]"
            value={currentPath}
            onChange={(event) => updateParams({ path: event.target.value }, true)}
          >
            <option value="">Todos os destinos</option>
            <option value="1">Fora do perfil</option>
            <option value="2">Encaminhado a parceiro</option>
            <option value="3">Atendimento interno</option>
          </select>

          <select
            className="h-10 rounded-xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 text-sm text-[#111827]"
            value={currentStatus}
            onChange={(event) => updateParams({ status: event.target.value }, true)}
          >
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="contacted">Contatado</option>
            <option value="in_conversation">Em conversa</option>
            <option value="handoff_done">Transferido</option>
            <option value="disqualified_cnpj">CNPJ invalido</option>
            <option value="disqualified_policy">Politica interna</option>
            <option value="send_failed">Falha no envio</option>
          </select>

          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          ) : null}
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
              <thead className="bg-[#F8F7F4]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-[#E5E7EB]">
                    {headerGroup.headers.map((header) => {
                      const sortKey = SORT_FIELDS[header.column.id]
                      const isSorted = sortKey && sortBy === sortKey

                      return (
                        <th
                          key={header.id}
                          className="relative border-b border-[#E5E7EB] px-3 py-2.5 text-left align-middle"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : sortKey ? (
                            <button
                              type="button"
                              onClick={() => handleSort(sortKey)}
                              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280] transition-colors hover:text-[#111827]"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {isSorted ? (
                                sortOrder === "asc" ? (
                                  <ArrowUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowDown className="h-3.5 w-3.5" />
                                )
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                              )}
                            </button>
                          ) : (
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}

                          {header.column.getCanResize() ? (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none select-none",
                                header.column.getIsResizing() && "bg-[#B2121A]/15"
                              )}
                            />
                          ) : null}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-10 text-center text-sm text-[#6B7280]"
                    >
                      Nenhum lead encontrado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "cursor-pointer border-b border-[#EEF0F2] bg-white transition-colors hover:bg-[#FAF7F6]",
                        selectedLeadId === row.original.id && "bg-[#FEF4F4]"
                      )}
                      onClick={() =>
                        updateParams({ leadId: row.original.id }, false)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="border-b border-[#EEF0F2] px-3 py-3 align-top whitespace-normal"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-[#111827]">
            {from}-{to} de {total} leads
          </p>
          <p className="text-xs text-[#6B7280]">
            Clique em um cabeçalho para ordenar e arraste a borda da coluna
            para ajustar a largura.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) }, false)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="min-w-20 text-center text-sm font-medium text-[#111827]">
            Pagina {page} de {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) }, false)}
          >
            Proxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

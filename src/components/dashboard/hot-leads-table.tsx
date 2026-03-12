"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Search,
  UserRound,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { HotLead } from "@/lib/queries/hot-leads"
import { PRIORITY_LABELS } from "@/lib/utils/constants"
import { formatDateTime, formatPhone, formatRelativeTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "asx-hot-leads-table-sizing-v1"

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
}

interface HotLeadsTableProps {
  leads: HotLead[]
  selectedLeadId?: string
}

export function HotLeadsTable({
  leads,
  selectedLeadId,
}: HotLeadsTableProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [globalFilter, setGlobalFilter] = useState("")

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
    setGlobalFilter(search)
  }, [search])

  function openLead(leadId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("leadId", leadId)
    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  const columns: ColumnDef<HotLead>[] = [
    {
      accessorKey: "priority",
      id: "priority",
      size: 108,
      minSize: 94,
      header: "Prioridade",
      sortingFn: (rowA, rowB) => {
        const a = PRIORITY_ORDER[rowA.original.priority ?? "medium"] ?? 3
        const b = PRIORITY_ORDER[rowB.original.priority ?? "medium"] ?? 3
        return a - b
      },
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            PRIORITY_COLORS[row.original.priority ?? "medium"] ??
            PRIORITY_COLORS.medium
          }
        >
          {PRIORITY_LABELS[row.original.priority ?? "medium"]}
        </Badge>
      ),
    },
    {
      id: "lead",
      size: 240,
      minSize: 210,
      accessorFn: (row) => `${row.nome} ${row.empresa ?? ""} ${row.telefone}`,
      header: "Lead",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-[#111827]">{row.original.nome}</p>
          <p className="text-xs text-[#6B7280]">
            {row.original.empresa ?? "Empresa nao identificada"}
          </p>
          <p className="text-xs text-[#8A94A6]">
            {formatPhone(row.original.telefone)}
          </p>
        </div>
      ),
    },
    {
      id: "context",
      size: 150,
      minSize: 132,
      accessorFn: (row) =>
        `${row.estado} ${row.perfil} ${row.volume_faixa}`.toLowerCase(),
      header: "Contexto",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#4B5563]">{row.original.estado}</p>
          <p className="line-clamp-1 text-xs text-[#6B7280]">
            {row.original.perfil}
          </p>
          <p className="line-clamp-1 text-xs text-[#8A94A6]">
            {row.original.volume_faixa}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "score",
      size: 110,
      minSize: 96,
      header: "Score",
      cell: ({ row }) =>
        row.original.class ? (
          <ScoreBadge
            scoreClass={row.original.class}
            score={row.original.score ?? undefined}
          />
        ) : (
          <span className="text-sm text-[#9CA3AF]">Nao calculado</span>
        ),
    },
    {
      accessorKey: "hours_waiting",
      size: 128,
      minSize: 114,
      header: "Esperando",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-[#111827]">
            {formatRelativeTime(row.original.last_activity)}
          </p>
          <p className="text-xs text-[#6B7280]">
            {row.original.hours_waiting}h desde a ultima atividade
          </p>
        </div>
      ),
    },
    {
      accessorKey: "vendedor",
      size: 150,
      minSize: 136,
      header: "Vendedor",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
            <span className="rounded-full bg-[#F3F4F6] p-1.5 text-[#6B7280]">
              <UserRound className="h-3.5 w-3.5" />
            </span>
            {row.original.vendedor ?? "Sem transferencia"}
          </div>
          <p className="text-xs text-[#6B7280]">
            {row.original.assigned_at
              ? `Atribuido em ${formatDateTime(row.original.assigned_at)}`
              : "Nenhum vendedor vinculado ainda"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      size: 118,
      minSize: 104,
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ]

  const table = useReactTable({
    data: leads,
    columns,
    defaultColumn: {
      minSize: 96,
      size: 140,
    },
    initialState: {
      sorting: [
        { id: "priority", desc: false },
        { id: "hours_waiting", desc: true },
      ],
    },
    state: {
      columnSizing,
      globalFilter,
    },
    onColumnSizingChange: setColumnSizing,
    onGlobalFilterChange: setGlobalFilter,
    columnResizeMode: "onChange",
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      return [
        row.original.nome,
        row.original.empresa,
        row.original.telefone,
        row.original.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#111827]">
              Acompanhamento de leads quentes
            </p>
            <p className="text-xs text-[#6B7280]">
              Ordene por prioridade ou espera e abra o lead sem sair da fila.
            </p>
          </div>

          <div className="relative min-w-[250px] flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              placeholder="Buscar na fila quente..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl border-[#E5E7EB] bg-[#FCFCFB] pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead className="bg-[#F8F7F4]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted()

                    return (
                      <th
                        key={header.id}
                        className="relative border-b border-[#E5E7EB] px-3 py-2.5 text-left"
                        style={{ width: header.getSize() }}
                      >
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280] transition-colors hover:text-[#111827]"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {isSorted === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : isSorted === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5" />
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
                    Nenhum lead quente encontrado.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer border-b border-[#EEF0F2] bg-white transition-colors hover:bg-[#FAF7F6]",
                      row.original.hours_waiting > 24 && "bg-red-50/60",
                      selectedLeadId === row.original.fb_lead_id && "bg-[#FEF4F4]"
                    )}
                    onClick={() => openLead(row.original.fb_lead_id)}
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
  )
}

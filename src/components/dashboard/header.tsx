"use client"

import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/lib/utils/constants"
import { MobileSidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context"

const PAGE_META: Record<string, { title: string; hint: string }> = {
  "/": {
    title: "Visão Geral",
    hint: "Resumo da temperatura da operação",
  },
  "/leads": {
    title: "Leads",
    hint: "Busca, triagem e acompanhamento",
  },
  "/funil": {
    title: "Funil",
    hint: "Conversão por etapa do processo",
  },
  "/vendedores": {
    title: "Vendedores",
    hint: "Distribuição comercial e desempenho",
  },
  "/distribuidores": {
    title: "Distribuidores",
    hint: "Rede recomendada por região",
  },
  "/comparativos": {
    title: "Comparativos",
    hint: "Leitura temporal da operação",
  },
  "/leads-quentes": {
    title: "Leads Quentes",
    hint: "Monitoramento prioritario apos handoff",
  },
}

export function Header() {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed } = useDashboardShell()

  const pageMeta =
    PAGE_META[pathname] ??
    PAGE_META[
      NAV_ITEMS.find((item) =>
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
      )?.href ?? "/"
    ] ?? {
      title: "Painel",
      hint: "Operação comercial ASX",
    }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/78 md:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={toggleCollapsed}
          className="hidden border-border/70 bg-card/80 text-foreground shadow-none hover:bg-muted md:inline-flex"
          title={collapsed ? "Expandir menu" : "Retrair menu"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Cockpit comercial
          </p>
          <h1 className="truncate text-lg font-semibold text-foreground md:text-xl">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      <div className="hidden items-center md:flex">
        <div className="rounded-full border border-border/70 bg-card/75 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {pageMeta.hint}
        </div>
      </div>
    </header>
  )
}

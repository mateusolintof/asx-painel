"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Filter,
  UserCheck,
  Building2,
  BarChart3,
  Flame,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/utils/constants"
import { createClient } from "@/lib/supabase/client"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context"

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Filter,
  UserCheck,
  Building2,
  BarChart3,
  Flame,
}

function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const shell = useDashboardShell()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      <div
        className={cn(
          "border-b border-white/6",
          collapsed ? "px-2 py-3" : "px-4 py-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "flex-col gap-2" : "justify-between gap-3"
          )}
        >
          <Link
            href="/"
            onClick={onNavigate}
            className={cn(
              "flex items-center rounded-xl transition-colors hover:text-white",
              collapsed ? "justify-center" : "gap-2.5"
            )}
            title="Ir para Visão Geral"
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 font-semibold tracking-[0.2em] text-white",
                collapsed ? "h-10 w-10 text-xs" : "h-10 px-3 text-[0.7rem]"
              )}
            >
              ASX
            </span>
            {!collapsed && (
              <span className="text-sm font-medium tracking-[0.18em] text-white/84">
                Painel
              </span>
            )}
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={shell.toggleCollapsed}
            className="hidden text-white/72 hover:bg-white/6 hover:text-white md:inline-flex"
            title={collapsed ? "Expandir menu" : "Retrair menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className={cn("px-3 pt-3", collapsed && "px-2.5")}>
        {!collapsed && (
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">
            Operação
          </p>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 px-3 py-3",
          collapsed && "space-y-2 px-2.5"
        )}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed
                  ? "justify-center px-0 py-2.5"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/58 hover:bg-white/6 hover:text-white/88"
              )}
              aria-label={item.label}
            >
              {Icon && (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-lg",
                    collapsed
                      ? "h-10 w-10 bg-white/6 text-white/78 group-hover:bg-white/10"
                      : "text-current"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
              )}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div
        className={cn(
          "border-t border-white/6 p-3",
          collapsed && "px-2.5 pb-4 pt-3"
        )}
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#A3A3A3] transition-colors hover:bg-[#262626] hover:text-white"
          title={collapsed ? "Sair" : undefined}
          aria-label="Sair"
        >
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg",
              collapsed && "h-10 w-10 bg-white/6 text-white/72"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
          </span>
          {!collapsed && "Sair"}
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const { collapsed } = useDashboardShell()

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-[linear-gradient(180deg,rgba(17,19,22,0.98),rgba(17,19,22,0.94))] shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] md:flex md:transition-[width] md:duration-200 md:ease-out"
      style={{ width: "var(--dashboard-sidebar-width)" }}
    >
      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden">
        <Menu className="h-5 w-5 text-[#6B7280]" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[17rem] border-sidebar-border bg-[linear-gradient(180deg,rgba(17,19,22,0.98),rgba(17,19,22,0.95))] p-0"
      >
        <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
        <div className="flex h-full flex-col">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

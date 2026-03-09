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

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Filter,
  UserCheck,
  Building2,
  BarChart3,
  Flame,
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold tracking-tight text-white">
          <span className="text-[#B2121A]">ASX</span> Painel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#262626] text-white"
                  : "text-[#A3A3A3] hover:bg-[#262626] hover:text-white"
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#333333] p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#A3A3A3] transition-colors hover:bg-[#262626] hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-[#1A1A1A] md:flex">
      <SidebarNav />
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
        className="w-64 bg-[#1A1A1A] p-0"
      >
        <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
        <div className="flex h-full flex-col">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

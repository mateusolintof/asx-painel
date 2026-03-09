"use client"

import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/lib/utils/constants"
import { MobileSidebar } from "@/components/dashboard/sidebar"

const PAGE_TITLES: Record<string, string> = {
  "/": "Vis\u00e3o Geral",
  "/leads": "Leads",
  "/funil": "Funil",
  "/vendedores": "Vendedores",
  "/distribuidores": "Distribuidores",
  "/comparativos": "Comparativos",
  "/leads-quentes": "Leads Quentes",
}

export function Header() {
  const pathname = usePathname()

  const title =
    PAGE_TITLES[pathname] ??
    NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )?.label ??
    "Painel"

  return (
    <header className="flex h-16 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 md:px-8">
      <MobileSidebar />
      <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
    </header>
  )
}

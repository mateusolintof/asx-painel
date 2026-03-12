"use client"

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardShellContext } from "@/components/dashboard/dashboard-shell-context"

const SIDEBAR_STORAGE_KEY = "asx:dashboard-shell-collapsed"

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (storedValue === "true") {
      setCollapsed(true)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
  }, [collapsed, hydrated])

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
    }),
    [collapsed]
  )

  const style = {
    "--sidebar-width-expanded": "15rem",
    "--sidebar-width-collapsed": "4.75rem",
    "--dashboard-sidebar-width": collapsed
      ? "var(--sidebar-width-collapsed)"
      : "var(--sidebar-width-expanded)",
  } as CSSProperties

  return (
    <DashboardShellContext.Provider value={value}>
      <div className="min-h-screen bg-background" style={style}>
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col transition-[padding] duration-200 ease-out md:pl-[var(--dashboard-sidebar-width)]">
          <Header />
          <main className="flex-1 bg-background px-4 py-4 md:px-6 md:py-5 lg:px-7">
            {children}
          </main>
        </div>
      </div>
    </DashboardShellContext.Provider>
  )
}

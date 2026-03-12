"use client"

import { createContext, useContext } from "react"

interface DashboardShellContextValue {
  collapsed: boolean
  toggleCollapsed: () => void
}

export const DashboardShellContext =
  createContext<DashboardShellContextValue | null>(null)

export function useDashboardShell() {
  const context = useContext(DashboardShellContext)

  if (!context) {
    throw new Error("useDashboardShell must be used within DashboardShell")
  }

  return context
}

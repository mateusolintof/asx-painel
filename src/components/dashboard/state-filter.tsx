"use client"

import { useRouter, usePathname } from "next/navigation"

interface StateFilterProps {
  currentState?: string
  states: string[]
}

export function StateFilter({ currentState, states }: StateFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <select
      name="estado"
      defaultValue={currentState ?? ""}
      className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]"
      onChange={(e) => {
        const url = e.target.value
          ? `${pathname}?estado=${e.target.value}`
          : pathname
        router.push(url)
      }}
    >
      <option value="">Todos os Estados</option>
      {states.map((uf) => (
        <option key={uf} value={uf}>
          {uf}
        </option>
      ))}
    </select>
  )
}

"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface StateFilterProps {
  currentState?: string
  states: string[]
}

export function StateFilter({ currentState, states }: StateFilterProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <select
      name="estado"
      defaultValue={currentState ?? ""}
      className="h-10 rounded-xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 text-sm text-[#111827]"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value) {
          params.set("estado", e.target.value)
        } else {
          params.delete("estado")
        }

        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
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

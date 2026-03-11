"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
      <Card className="w-full border bg-white p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-[#B2121A]" />
          </div>
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">
                Nao foi possivel carregar esta pagina
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                O dashboard recebeu um erro ao consultar o Supabase. A tela foi
                interrompida para nao exibir um estado enganoso como se fosse
                &quot;sem dados&quot;.
              </p>
            </div>

            <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                Erro
              </p>
              <p className="mt-1 text-sm text-[#111827]">{error.message}</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={reset}
              className="inline-flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

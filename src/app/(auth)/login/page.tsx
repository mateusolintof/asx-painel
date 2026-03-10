"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Email ou senha incorretos")
      setLoading(false)
      return
    }

    window.location.href = "/"
  }

  return (
    <Card className="w-full max-w-sm border bg-white p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
          <span className="text-[#B2121A]">ASX</span> Painel
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Gestão de Leads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-[#111827]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-[#111827]">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-[#EF4444]">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B2121A] text-white hover:bg-[#8E0F15]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Card>
  )
}

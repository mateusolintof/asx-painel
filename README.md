# ASX Painel — Dashboard de Gestao Comercial

Painel de gestao para a equipe da **ASX Iluminacao Automotiva** acompanhar leads, funil de vendas, vendedores e distribuidores.

**Este painel faz parte de um sistema maior:** o Agente SDR de IA da ASX, que qualifica leads B2B vindos do Facebook Ads via WhatsApp. Para entender o sistema completo, leia [`docs/arquitetura.md`](docs/arquitetura.md).

---

## Stack

- **Next.js 16** (App Router, Server Components)
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Shadcn/UI 4**
- **Recharts** (graficos)
- **Supabase** (banco de dados + auth)

## Paginas

| Rota | Pagina | O que mostra |
|------|--------|-------------|
| `/` | Overview | KPIs, trend line, distribuicao por path, funil resumido |
| `/leads` | Leads | Tabela paginada com filtros (path, status, busca) |
| `/leads/:id` | Detalhe | Dados do lead + historico de conversa com o agente |
| `/funil` | Funil | 7 estagios do funil com taxas de conversao |
| `/vendedores` | Vendedores | Performance de cada vendedor (leads, scores) |
| `/distribuidores` | Distribuidores | Recomendacoes feitas para leads Path 2 |
| `/comparativos` | Comparativos | Semana/Mes atual vs anterior |
| `/leads-quentes` | Leads Quentes | Leads Path 3 parados que precisam de atencao |

## Como rodar

```bash
# Copiar variaveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com as chaves do Supabase

# Instalar e rodar
npm install
npm run dev        # http://localhost:3000
npm run build      # Verificar tipos e compilar
```

## Variaveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Deploy

Vercel (recomendado):
1. Push para GitHub
2. Import no Vercel
3. Configurar env vars
4. Dominio: `painel.asxiluminacao.com.br`

## Documentacao

- [`CLAUDE.md`](CLAUDE.md) — Instrucoes para IA (stack, estrutura, regras)
- [`docs/arquitetura.md`](docs/arquitetura.md) — Arquitetura do sistema completo
- [`.interface-design/system.md`](.interface-design/system.md) — Design system (cores, tokens, padroes)
- [`supabase-views.sql`](supabase-views.sql) — Views SQL para executar no Supabase

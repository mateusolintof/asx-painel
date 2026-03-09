# ASX Painel — Instrucoes para IA

## O Que E Este Projeto

Este e o **painel de gestao comercial** da ASX Iluminacao Automotiva.
Ele **NAO e um projeto isolado**. Faz parte de um sistema maior: o **Agente SDR de IA da ASX**, que qualifica leads B2B vindos do Facebook Ads via WhatsApp.

Este painel e a interface visual onde os gestores da ASX acompanham:
- Quantos leads entraram, foram qualificados, transferidos
- Performance dos vendedores
- Distribuidores parceiros recomendados
- Leads quentes que precisam de atencao

O sistema completo (agente IA, workflows, banco de dados) esta documentado em outro repositorio:
`/Users/mateusolinto/Convert/Projetos-Clientes/ASX-Agente/`

**Leia `docs/arquitetura.md` deste repositorio** para entender o sistema completo antes de fazer qualquer alteracao.

---

## Stack

| Tecnologia | Versao | Funcao |
|------------|--------|--------|
| Next.js | 16.1.6 | Framework (App Router, Server Components) |
| React | 19.2.3 | UI |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 4.x | Estilizacao |
| Shadcn/UI | 4.0.2 | Componentes base (Card, Badge, Table, Button, etc.) |
| Recharts | latest | Graficos (funil, trend line, pie, bar) |
| Lucide React | latest | Icones |
| react-day-picker | 9.x | Calendario (base do Shadcn Calendar) |
| date-fns | latest | Formatacao de datas (locale pt-BR) |
| @supabase/ssr | latest | Cliente Supabase com cookies SSR |
| @supabase/supabase-js | latest | SDK Supabase |

**NAO instalado (e por que):**
- Tremor: incompativel com React 19. KPI cards feitos com Shadcn Card.
- TanStack Table: tabelas implementadas com Shadcn Table + logica manual para manter simplicidade.
- MUI X Date Picker: planejado mas ainda nao implementado. Date range usa presets (semana/mes).

---

## Estrutura de Arquivos

```
src/
  app/
    layout.tsx                          # Root layout (Inter font, metadata)
    globals.css                         # Tokens CSS (cores ASX, paths, temperatura)
    (auth)/
      layout.tsx                        # Layout sem sidebar (tela cheia centralizada)
      login/page.tsx                    # Login Supabase Auth (email/password)
    (dashboard)/
      layout.tsx                        # Layout com Sidebar + Header
      page.tsx                          # / — Visao Geral (KPIs, trend, funil, pie)
      leads/page.tsx                    # /leads — Tabela paginada com filtros
      leads/[id]/page.tsx               # /leads/:id — Detalhe + conversa
      funil/page.tsx                    # /funil — Funil 7 estagios + taxas
      vendedores/page.tsx               # /vendedores — Cards por vendedor
      distribuidores/page.tsx           # /distribuidores — Tabela recomendacoes
      comparativos/page.tsx             # /comparativos — Semana/Mes vs anterior
      leads-quentes/page.tsx            # /leads-quentes — Leads P3 parados
    api/auth/callback/route.ts          # Supabase Auth callback
  components/
    ui/                                 # Shadcn (gerado via CLI, NAO editar manualmente)
    dashboard/                          # Componentes do dashboard
      sidebar.tsx                       # Nav lateral fixa (bg #1A1A1A)
      header.tsx                        # Titulo da pagina
      kpi-card.tsx                      # Card com valor, label, delta
      funnel-chart.tsx                  # Recharts BarChart horizontal
      trend-line.tsx                    # Recharts AreaChart
      path-pie-chart.tsx                # Recharts PieChart (P1/P2/P3)
      comparison-chart.tsx              # Recharts BarChart comparativo
      lead-table.tsx                    # Tabela de leads com filtros (client)
      path-badge.tsx                    # Badge colorido por path (1/2/3)
      score-badge.tsx                   # Badge quente/morno/frio
      status-badge.tsx                  # Badge por status do lead
  lib/
    supabase/
      server.ts                         # createClient() para Server Components
      client.ts                         # createClient() para Client Components
    queries/                            # Todas as queries ao Supabase
      overview.ts                       # KPIs, trend, distribuicao path
      leads.ts                          # Lista paginada, detalhe por ID
      funnel.ts                         # Funil 7 estagios
      sellers.ts                        # Performance vendedores
      distributors.ts                   # Distribuidores recomendados
      comparisons.ts                    # Periodo A vs B
      hot-leads.ts                      # Leads P3 parados
    types/
      database.ts                       # Tipos TS para todas as tabelas
    utils/
      constants.ts                      # Labels, cores, nav items, sellers
      format.ts                         # Formatadores (moeda, data, telefone, CNPJ)
  middleware.ts                         # Auth redirect (protege rotas /dashboard)
```

---

## Banco de Dados (Supabase)

O painel **le dados** do Supabase. Ele nao escreve nada.
Os dados sao populados pelos workflows n8n do sistema ASX-Agente.

### Tabelas Consultadas

| Tabela | O que contem | Quem popula |
|--------|-------------|-------------|
| `fb_leads` | Cada lead do formulario Facebook (path, status, dados) | WF06 (outbound) |
| `leads` | Leads qualificados com score/class/priority | WF03 (finalize-handoff) |
| `ia_messages` | Historico de conversas agente <> lead | WF07 (inbound) |
| `assignments` | Vinculo lead -> vendedor (round-robin) | WF03 |
| `agents` | Vendedores (Queila, Tiago) | Manual |
| `contacts` | Contatos com telefone | WF03 |
| `companies` | Empresas com CNPJ enriquecido | WF02A |
| `distributors` | 498 distribuidores parceiros | CSV importado |
| `distributor_recommendations` | Historico de recomendacoes | WF06 |

### Views SQL (a criar)

Arquivo `supabase-views.sql` na raiz contem 3 views que precisam ser executadas no Supabase SQL Editor:
- `v_funnel_summary` — Funil diario agregado
- `v_path3_pipeline` — Pipeline Path 3 com joins
- `v_regional_performance` — Performance por estado

### Status de um fb_lead

```
pending → contacted → in_conversation → handoff_done
                                      → disqualified_policy
          → disqualified_cnpj
          → send_failed
```

### Paths (classificacao do lead)

| Path | Criterio | Acao |
|------|----------|------|
| 1 | CNPJ invalido | Registrar e ignorar |
| 2 | Volume < R$4k OU fora do Norte/Nordeste | Redirecionar para distribuidores |
| 3 | Volume >= R$4k + regiao N/NE | Qualificacao IA + handoff vendedor |

### Score (Path 3)

| Score | Classe | Prioridade | Cor |
|-------|--------|------------|-----|
| 70-100 | quente | urgent | #B2121A (vermelho ASX) |
| 40-69 | morno | high | #D97706 (ambar) |
| 0-39 | frio | medium | #2563EB (azul) |

---

## Design System

Arquivo: `.interface-design/system.md`

### Principio Central: Metafora de Temperatura

O vermelho da marca ASX (#B2121A) e o vermelho do lead quente.
Identidade visual e metrica de negocio se fundem.

### Cores

| Token | Hex | Uso |
|-------|-----|-----|
| asx-red | #B2121A | Marca, CTA, lead quente |
| sidebar | #1A1A1A | Sidebar (asfalto) |
| page | #FAFAFA | Fundo da pagina |
| surface | #FFFFFF | Cards |
| path-1 | #EF4444 | Desqualificado |
| path-2 | #D97706 | Distribuidor |
| path-3 | #059669 | Qualificado |

### Padroes

- **KPI Card:** borda left colorida (4px) + valor grande + delta badge
- **Tabelas:** header uppercase, hover sutil, click para detalhe
- **Badges:** fundo tint + texto na cor do path/status/score
- **Sidebar:** fixa, escura, logo "ASX Painel" no topo

---

## Autenticacao

- Supabase Auth com email/password
- Sem signup publico — contas criadas manualmente no Supabase dashboard
- `middleware.ts` redireciona para `/login` se nao autenticado
- Server Components usam `SUPABASE_SERVICE_ROLE_KEY` para queries (bypass RLS)
- Client Components usam `NEXT_PUBLIC_SUPABASE_ANON_KEY` (apenas para auth)

---

## Variaveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://hxcfvyhjyibdexazrhox.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Copiar de `.env.local.example`. O `.env.local` ja esta no `.gitignore`.

---

## Como Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Verifica tipos e compila
```

---

## Como Fazer Deploy

Vercel (recomendado):
1. Push para GitHub
2. Import no Vercel
3. Configurar env vars
4. Dominio: `painel.asxiluminacao.com.br`

---

## Regras para IA

1. **Entender o contexto antes de agir.** Este painel depende dos dados produzidos pelo sistema ASX-Agente. Leia `docs/arquitetura.md`.
2. **Nao alterar as tabelas do Supabase.** O painel so le dados. Alteracoes no schema afetam os workflows n8n.
3. **Manter a metafora de temperatura.** Quente=vermelho, morno=ambar, frio=azul. Nao trocar cores arbitrariamente.
4. **Componentes Shadcn estao em `components/ui/`.** Foram gerados via CLI. Para adicionar novos: `npx shadcn@latest add [componente]`.
5. **Queries ficam em `lib/queries/`.** Cada arquivo corresponde a uma pagina. Server Components chamam as queries diretamente.
6. **Recharts precisa de "use client".** Todo componente que usa Recharts deve ter a diretiva. As paginas (Server Components) importam esses componentes.
7. **Dados de teste estao no Supabase.** Os testes documentados em `ASX-Agente/testes/` popularam dados reais nas tabelas.

---

## Pendencias

- [ ] Executar `supabase-views.sql` no Supabase SQL Editor
- [x] Conta admin criada (admin@asxpainel.com.br)
- [x] Responsividade mobile (sidebar colapsavel via Sheet, tabelas com scroll horizontal)
- [x] Date range picker (react-day-picker v9 + Shadcn Calendar, integrado em Overview e Funil)
- [ ] Dashboard tecnico (Metabase) — projeto separado, ver `ASX-Agente/docs/painel-dashboard-planejamento.md`

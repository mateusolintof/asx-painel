# Arquitetura do Sistema ASX — Como o Painel se Encaixa

> Este documento explica o sistema completo de atendimento automatizado da ASX Iluminacao Automotiva e como este painel de gestao se conecta a ele. **Leia este documento inteiro antes de fazer qualquer alteracao no painel.**

---

## 1. Visao Geral do Sistema

A ASX Iluminacao Automotiva e uma fabrica de iluminacao automotiva que vende para empresas (B2B). O sistema completo e composto por:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA ASX COMPLETO                         │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Facebook    │───>│  Agente IA   │───>│  Vendedores      │  │
│  │  Lead Ads    │    │  "Joao" (SDR)│    │  (Queila, Tiago) │  │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘  │
│                             │                                   │
│                    ┌────────┴────────┐                          │
│                    │  Supabase       │                          │
│                    │  (Banco Dados)  │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
│              ┌──────────────┼──────────────┐                   │
│              │              │              │                    │
│    ┌─────────▼──────┐ ┌────▼─────┐ ┌─────▼──────────┐        │
│    │ ESTE PAINEL    │ │ Metabase │ │ Chatwoot        │        │
│    │ (Gestao ASX)   │ │ (Tecnico)│ │ (Atendimento)   │        │
│    └────────────────┘ └──────────┘ └────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes do Sistema

| Componente | O que faz | Onde roda |
|------------|-----------|-----------|
| **Facebook Lead Ads** | Captura leads B2B via formulario | Facebook |
| **n8n (orquestrador)** | 10 workflows que processam leads | Easypanel (`flow.agenciaprospect.space`) |
| **Agente Joao (IA)** | SDR virtual que conversa via WhatsApp | GPT-4 via n8n |
| **Evolution API** | Middleware de conexao com WhatsApp | Easypanel (`api.agenciaprospect.space`) |
| **Chatwoot** | Painel de atendimento dos vendedores | Easypanel (`chat.agenciaprospect.space`) |
| **Supabase** | Banco de dados PostgreSQL | Cloud (`hxcfvyhjyibdexazrhox.supabase.co`) |
| **Este painel (Next.js)** | Dashboard de gestao para equipe ASX | Vercel (`painel.asxiluminacao.com.br`) |
| **Metabase** | Dashboard tecnico para a agencia Convert | Easypanel (`monitor.agenciaprospect.space`) |

### Repositorios

| Repositorio | Conteudo |
|-------------|----------|
| `ASX-Agente` | Documentacao do agente IA, workflows exportados, testes, logica do fluxo |
| `asx-painel` (este) | Codigo do painel de gestao Next.js |

---

## 2. O Agente SDR "Joao"

O Joao e um agente de IA que atua como SDR (Sales Development Representative) da ASX. Ele:

1. **Recebe leads** do formulario do Facebook Ads
2. **Classifica** automaticamente em 3 caminhos (paths)
3. **Envia a primeira mensagem** via WhatsApp (outbound)
4. **Conversa** com o lead quando ele responde (inbound)
5. **Transfere** leads qualificados para vendedores humanos (handoff)

### Os 3 Paths

```
Lead preenche formulario Facebook
         │
         ▼
    CNPJ valido?
    ├── NAO → PATH 1: Desqualificado (registra, ignora)
    └── SIM
         │
         ▼
    Volume >= R$4k E regiao Norte/Nordeste?
    ├── NAO → PATH 2: Redireciona para distribuidores parceiros
    └── SIM → PATH 3: Qualificacao IA → Score → Handoff vendedor
```

| Path | Criterio | Acao do Joao |
|------|----------|-------------|
| **1** | CNPJ invalido | Nenhuma — lead registrado e ignorado |
| **2** | Volume baixo ou fora N/NE | Envia lista de distribuidores da regiao |
| **3** | Volume >= R$4k + N/NE | Conversa, qualifica, calcula score, transfere |

### Scoring (Path 3)

Leads Path 3 que completam a qualificacao recebem um score de 0-100:

| Score | Classe | Prioridade | Cor no painel |
|-------|--------|------------|---------------|
| 70-100 | Quente | Urgent | Vermelho (#B2121A) |
| 40-69 | Morno | High | Ambar (#D97706) |
| 0-39 | Frio | Medium | Azul (#2563EB) |

O vermelho do "lead quente" e propositalmente o mesmo vermelho da marca ASX — essa e a **metafora de temperatura** usada em todo o painel.

---

## 3. Workflows n8n

O sistema usa 10 workflows no n8n. Os dois principais sao:

### WF06 — Outbound (1a mensagem)

```
Facebook Trigger → Extrair dados → Normalizar telefone → Validar CNPJ
    → Classificar (Path 1/2/3) → Enviar WhatsApp
```

### WF07 — Inbound (respostas)

```
Webhook WhatsApp → Processar midia → Agrupar msgs (Redis 15s)
    → Identificar lead → Rota:
        ├── Ja qualificado → Notificar vendedor
        ├── Path 2 → Joao Direcionador → Responder
        ├── Path 3 → Joao Consultor → Responder
        └── Desconhecido → Auto-reply estatica
```

### Sub-workflows (ferramentas do Joao)

| WF | Nome | O que faz |
|----|------|-----------|
| 02 | Tool-Label | Aplica etiquetas no Chatwoot |
| 02A | Company-Enrich | Valida CNPJ na Receita Federal |
| 02B | Score-Lead | Calcula score 0-100 |
| 02C | Agent-Log | Registra eventos de auditoria |
| 02D | Find-Distributors | Busca distribuidores por estado |
| 03 | Finalize-Handoff | Transfere lead para vendedor |

---

## 4. Banco de Dados (Supabase)

### Tabelas

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  fb_leads    │────>│  contacts    │────>│  leads       │
│              │     │              │     │ (score,class)│
│ path,status  │     │ phone        │     └──────┬───────┘
│ nome,telefone│     └──────────────┘            │
│ cnpj,volume  │                          ┌──────▼───────┐
│ estado       │                          │ assignments  │
└──────────────┘                          │ lead→vendedor│
                                          └──────┬───────┘
┌──────────────┐                          ┌──────▼───────┐
│ ia_messages  │                          │   agents     │
│ phone,content│                          │ (vendedores) │
│ direction    │                          └──────────────┘
└──────────────┘
                    ┌──────────────┐     ┌──────────────────────┐
                    │ distributors │────>│ distributor_          │
                    │ (498 parceiros)│   │ recommendations      │
                    └──────────────┘     └──────────────────────┘

                    ┌──────────────┐
                    │  companies   │
                    │ (CNPJ enriq.)│
                    └──────────────┘
```

### Quem popula cada tabela

| Tabela | Quem popula | Quando |
|--------|-------------|--------|
| `fb_leads` | WF06 (outbound) | Lead preenche formulario Facebook |
| `contacts` | WF03 (finalize-handoff) | Lead e qualificado para handoff |
| `leads` | WF03 (finalize-handoff) | Lead recebe score e e transferido |
| `assignments` | WF03 (finalize-handoff) | Lead e atribuido a vendedor |
| `agents` | Manual (Supabase dashboard) | Cadastro de vendedores |
| `companies` | WF02A (company-enrich) | CNPJ validado na Receita Federal |
| `ia_messages` | WF07 (inbound) | Cada mensagem trocada (agente + lead) |
| `distributors` | CSV importado | Base fixa de distribuidores |
| `distributor_recommendations` | WF06 (outbound) | Lead Path 2 recebe recomendacao |

### O que este painel faz com essas tabelas

**Este painel APENAS LE dados. Ele nao escreve nada no banco.**

Os dados chegam ao banco via workflows n8n. O painel consulta e exibe em:

| Pagina do painel | Tabelas consultadas |
|-------------------|---------------------|
| Overview (KPIs, trend, pie) | `fb_leads`, `leads` |
| Leads (tabela + detalhe) | `fb_leads`, `contacts`, `leads`, `ia_messages`, `assignments`, `agents`, `distributor_recommendations` |
| Funil | `fb_leads` |
| Vendedores | `leads`, `assignments`, `agents` |
| Distribuidores | `distributors`, `distributor_recommendations` |
| Comparativos | `fb_leads`, `leads` |
| Leads Quentes | `fb_leads`, `contacts`, `leads`, `assignments`, `agents`, `ia_messages` |

### Status de um fb_lead

```
pending → contacted → in_conversation → handoff_done
                                       → disqualified_policy
          → disqualified_cnpj
          → send_failed
```

### Views SQL (a criar)

O arquivo `supabase-views.sql` na raiz contem 3 views que precisam ser executadas no Supabase SQL Editor:

- `v_funnel_summary` — Funil diario agregado por status/path
- `v_path3_pipeline` — Pipeline Path 3 com joins (lead + vendedor + score)
- `v_regional_performance` — Performance por estado/regiao

---

## 5. Arquitetura deste Painel (Next.js)

### Stack

| Tecnologia | Funcao |
|------------|--------|
| Next.js 16 (App Router) | Framework — Server Components para data fetching |
| React 19 | UI |
| TypeScript | Tipagem |
| Tailwind CSS 4 | Estilizacao |
| Shadcn/UI 4 | Componentes base (Card, Badge, Table, Button, etc.) |
| Recharts | Graficos (funil, trend, pie, comparativo) |
| Lucide React | Icones |
| @supabase/ssr | Auth com cookies SSR |

### Padrao de dados: Server Components → Queries

```
Pagina (Server Component)
    │
    └── chama funcao em lib/queries/*.ts
            │
            └── usa createClient() de lib/supabase/server.ts
                    │
                    └── query ao Supabase com SUPABASE_SERVICE_ROLE_KEY
                            │
                            └── retorna dados tipados
```

Cada pagina e um Server Component que:
1. Chama funcoes de query (ex: `getKPIs()`, `getLeads()`)
2. Recebe dados ja tipados
3. Renderiza HTML ou passa dados para Client Components (graficos)

### Padrao de interatividade: Client Components

Componentes que usam Recharts ou tem interacao (filtros, paginacao) precisam da diretiva `"use client"`. Eles ficam em `components/dashboard/` e sao importados pelas paginas Server Component.

```
src/app/(dashboard)/page.tsx          ← Server Component (fetch data)
    └── importa <TrendLine data={...} />  ← Client Component (renderiza grafico)
```

### Autenticacao

- Supabase Auth com email/password
- Sem signup publico — contas criadas manualmente no Supabase dashboard
- `middleware.ts` protege todas as rotas `(dashboard)/*`
- Server Components usam `SUPABASE_SERVICE_ROLE_KEY` para queries (bypass RLS)
- Client Components usam `NEXT_PUBLIC_SUPABASE_ANON_KEY` (apenas para auth)

---

## 6. Design System — Metafora de Temperatura

O design do painel e construido sobre uma metafora central: **a temperatura do lead**.

O vermelho da marca ASX (#B2121A) e o mesmo vermelho do lead quente. A identidade visual e a metrica de negocio se fundem. Isso nao e coincidencia — e intencional.

### Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| `asx-red` | #B2121A | Marca, CTA, lead quente, sidebar accent |
| `sidebar` | #1A1A1A | Sidebar escura (asfalto) |
| `page` | #FAFAFA | Fundo da pagina |
| `surface` | #FFFFFF | Cards |
| `temp-quente` | #B2121A | Score 70-100 |
| `temp-morno` | #D97706 | Score 40-69 |
| `temp-frio` | #2563EB | Score 0-39 |
| `path-1` | #EF4444 | Desqualificado |
| `path-2` | #D97706 | Distribuidor |
| `path-3` | #059669 | Qualificado |

### Padroes visuais

- **KPI Card:** borda esquerda colorida (4px) + valor grande + delta badge
- **Tabelas:** header uppercase, hover sutil, click para detalhe
- **Badges:** fundo tint + texto na cor do path/status/score
- **Sidebar:** fixa, escura (#1A1A1A), logo no topo, nav items com icones

Arquivo de referencia: `.interface-design/system.md`

---

## 7. Fluxo de Dados: Do Facebook ao Painel

```
1. Lead preenche formulario no Facebook Ads
                    │
                    ▼
2. Webhook dispara WF06 (n8n)
   - Extrai dados do formulario
   - Valida CNPJ (WF02A)
   - Classifica em Path 1, 2 ou 3
   - Salva em fb_leads (Supabase)
   - Envia 1a mensagem WhatsApp (Evolution API)
                    │
                    ▼
3. Lead responde no WhatsApp
                    │
                    ▼
4. Webhook dispara WF07 (n8n)
   - Identifica o lead pelo telefone
   - Roteia para agente correto (P2 ou P3)
   - Agente Joao responde
   - Salva mensagens em ia_messages (Supabase)
                    │
                    ▼
5. [Se Path 3] Joao qualifica → WF02B calcula score
   → WF03 faz handoff → vendedor notificado
   - Salva em leads, assignments (Supabase)
                    │
                    ▼
6. ESTE PAINEL consulta Supabase e exibe:
   - KPIs agregados
   - Funil de conversao
   - Tabela de leads com filtros
   - Performance por vendedor
   - Leads classificados como quentes em acompanhamento prioritario
   - Comparativos entre periodos
```

---

## 8. O que NAO Alterar

1. **Schema do banco de dados** — alteracoes nas tabelas quebram os workflows n8n
2. **Metafora de temperatura** — quente=vermelho, morno=ambar, frio=azul e intencional
3. **Cores dos paths** — path-1=vermelho, path-2=ambar, path-3=verde sao padrao do sistema
4. **Queries que usam service_role** — necessario para bypass RLS em Server Components
5. **Logica dos paths** — os criterios (CNPJ, volume, regiao) sao definidos nos workflows n8n

---

## 9. Documentacao Relacionada

| Documento | Localizacao | Conteudo |
|-----------|-------------|----------|
| Logica completa do fluxo | `ASX-Agente/docs/logica-do-fluxo.md` | Paths, scoring, handoff, tools, exemplos de conversa |
| Workflows exportados | `ASX-Agente/workflows/*.json` | 10 workflows n8n (sanitizados) |
| Mapa de workflows | `ASX-Agente/workflows/README.md` | Dependencias entre workflows |
| Testes | `ASX-Agente/testes/*.md` | 7 casos de teste validados |
| Design system | `asx-painel/.interface-design/system.md` | Paleta, tokens, padroes visuais |
| Instrucoes para IA | `asx-painel/CLAUDE.md` | Stack, estrutura, regras |
| Planejamento original | `ASX-Agente/docs/painel-dashboard-planejamento.md` | Decisoes de arquitetura |

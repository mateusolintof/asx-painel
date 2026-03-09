# ASX Painel — Design System

## Intent
Gestor comercial da ASX Iluminacao, cockpit de vendas B2B automotivo.
Acompanhar funil, cobrar vendedores, identificar leads quentes.
Sensacao: controle de operacao comercial — denso mas legivel, profissional mas quente.

## Signature
Metafora de temperatura: frio=azul, morno=ambar, quente=vermelho ASX.
O vermelho da marca (#B2121A) E o vermelho do lead quente. Identidade e metrica se fundem.

## Palette

### Foundation
- `--page`: #FAFAFA (farol branco-quente)
- `--surface`: #FFFFFF (cards)
- `--sidebar`: #1A1A1A (asfalto)
- `--sidebar-text`: #A3A3A3
- `--sidebar-active`: #FFFFFF
- `--sidebar-hover`: #262626
- `--border`: #E5E7EB
- `--border-subtle`: #F3F4F6

### Text
- `--text-primary`: #111827
- `--text-secondary`: #6B7280
- `--text-muted`: #9CA3AF

### Brand
- `--asx-red`: #B2121A (primaria, lead quente, CTA)
- `--asx-red-hover`: #8E0F15
- `--asx-red-light`: #FEE2E2 (badges fundo)

### Semantic — Temperatura
- `--temp-quente`: #B2121A (score 70-100)
- `--temp-quente-bg`: #FEE2E2
- `--temp-morno`: #D97706 (score 40-69)
- `--temp-morno-bg`: #FEF3C7
- `--temp-frio`: #2563EB (score 0-39)
- `--temp-frio-bg`: #DBEAFE

### Semantic — Paths
- `--path-1`: #EF4444 (desqualificado)
- `--path-1-bg`: #FEE2E2
- `--path-2`: #D97706 (distribuidor)
- `--path-2-bg`: #FEF3C7
- `--path-3`: #059669 (qualificado)
- `--path-3-bg`: #D1FAE5

### Semantic — Status
- `--status-success`: #059669
- `--status-warning`: #D97706
- `--status-error`: #EF4444
- `--status-info`: #2563EB
- `--status-neutral`: #6B7280

### Charts
- `--chart-1`: #B2121A (vermelho ASX)
- `--chart-2`: #059669 (verde)
- `--chart-3`: #2563EB (azul)
- `--chart-4`: #D97706 (ambar)
- `--chart-5`: #7C3AED (roxo)
- `--chart-6`: #6B7280 (cinza)

## Depth
Borders + subtle surface shift. Sem sombras pesadas.
- Cards: `border border-[--border]` sobre `bg-white`
- Page: `bg-[--page]`
- Hover em cards: nenhum efeito (estabilidade)
- Focus: `ring-2 ring-[--asx-red]/20`

## Typography
- Family: Inter (geometrica, legivel em numeros)
- KPI value: text-3xl font-semibold tracking-tight
- KPI label: text-sm text-[--text-secondary]
- KPI delta: text-xs font-medium
- Page title: text-xl font-semibold
- Section title: text-base font-medium
- Table header: text-xs font-medium uppercase tracking-wider text-[--text-secondary]
- Table cell: text-sm
- Badge: text-xs font-medium
- Sidebar link: text-sm font-medium

## Spacing
- Base: 4px
- Card padding: p-6 (24px)
- Card gap: gap-6 (24px)
- Section gap: gap-8 (32px)
- KPI grid: grid-cols-4 gap-6
- Sidebar width: w-64 (256px)
- Sidebar padding: px-4 py-6
- Page padding: p-8

## Borders
- Radius cards: rounded-lg (8px)
- Radius badges: rounded-md (6px)
- Radius buttons: rounded-md (6px)
- Radius inputs: rounded-md (6px)
- Border color: border-[--border]

## Patterns

### KPI Card
- Left color accent border (4px) matching the metric meaning
- Value large, label small below, delta badge top-right
- `border-l-4 border-l-[color]`

### Path Badge
- Solid background tint + text in path color
- P1: bg-red-100 text-red-800
- P2: bg-amber-100 text-amber-800
- P3: bg-emerald-100 text-emerald-800

### Score Badge
- Same temperature pattern
- Quente: bg-red-100 text-red-800
- Morno: bg-yellow-100 text-yellow-800
- Frio: bg-blue-100 text-blue-800

### Sidebar
- Fixed left, full height, bg-[#1A1A1A]
- Logo top, nav links with icons, active = white text + subtle bg
- Mobile: Sheet overlay from left

### Data Tables
- Striped rows (odd:bg-[--page])
- Hover: bg-gray-50
- Sticky header
- Pagination at bottom

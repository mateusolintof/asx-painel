# ASX Painel — Design System

## Intent
Gestor comercial da ASX Iluminacao em rotina de operacao B2B.
Ele abre o painel para priorizar fila, ler a temperatura dos leads, acompanhar o funil real de handoff e cobrar vendedores sem perder tempo com chrome de interface.
Sensacao: cockpit comercial quente, compacto, legivel e confiavel.

## Domain
- temperatura comercial
- fila quente
- handoff para vendedor
- desvio para distribuidores
- funil Path 3
- operacao de WhatsApp
- cobertura regional Norte/Nordeste

## Color World
- asfalto escuro do painel lateral
- porcelana quente do canvas
- vermelho de freio / alerta ASX
- ambar operacional de triagem
- verde de avancar no pipeline
- azul frio de status e leitura analitica

## Signature
O produto nao usa um dashboard generico de cards soltos.
Ele combina duas marcas de linguagem:
- metafora de temperatura ASX: vermelho = quente / critico / marca
- funil com branch explicito: Path 2 aparece como desvio operacional fora do funil principal de handoff

Esse branch-aware funnel e a fila quente com detalhe lateral sao os elementos mais especificos do produto.

## Rejecting Defaults
- Sidebar larga e permanente -> trilho retratil que libera area util
- Tabela HTML rigida -> grade operacional com ordenacao, resize e detalhe lateral
- Funil como barras genericas -> funil Path 3 com queda entre etapas e desvio P2 separado

## Palette

### Foundation
- `--background`: `#F5F3EE`
- `--card`: `#FCFBF8`
- `--popover`: `#FFFCF8`
- `--secondary`: `#ECE8DF`
- `--muted`: `#EEE9E1`
- `--border`: `#DDD7CC`
- `--input`: `#D7D1C6`

### Text
- `--foreground`: `#111827`
- `--muted-foreground`: `#6B7280`
- metadata / tertiary text: `#94A3B8`
- disabled / faint metadata: `#8A94A6`

### Sidebar
- `--sidebar`: `#111316`
- `--sidebar-foreground`: `#96A0AF`
- `--sidebar-border`: `rgba(255, 255, 255, 0.06)`
- background treatment: dark asphalt gradient, not flat black

### Brand + Semantic
- `--primary`: `#B2121A`
- quente / marca: `#B2121A`
- morno / triagem: `#D97706`
- qualificado / progresso: `#059669`
- informativo / status: `#2563EB`
- conversa / etapa intermediaria: `#4F46E5`

## Depth
Strategy: borders + subtle surface shifts.

Rules:
- cards e tabelas usam borda clara e superficies quase tom-sobre-tom
- sem sombras pesadas em cards
- tooltip pode usar sombra leve apenas para destacar overlay
- hover deve deslocar percepcao, nao criar efeito chamativo

## Typography
- Family: Inter
- Page eyebrow: `11px`, uppercase, tracking forte (`0.16em` a `0.22em`)
- Page title: `text-lg` a `text-xl`, `font-semibold`
- Section title: `text-base`, `font-medium`
- KPI value: ~`2rem`, `font-semibold`, `tracking-tight`
- Table header: `11px`, uppercase, tracking forte
- Table cell primary: `text-sm`
- Metadata: `text-xs`
- Dados numericos e percentuais devem privilegiar peso e alinhamento, nao ornamento

## Spacing
- Base unit: `4px`
- Main shell: `px-4 py-4 md:px-6 md:py-5 lg:px-7`
- Section gap: `gap-4` ou `space-y-4/6`
- Card padding padrao: `p-4`
- Card padding detalhado: `p-5`
- Table/filter rail: `px-4 py-3`
- Detail micro-cards: `px-3 py-2.5`

## Radius
- Large surfaces: `rounded-2xl`
- Inputs / filter controls: `rounded-xl`
- Status chips / pills: `rounded-full`
- Utility buttons pequenos: `rounded-xl`

## Shell Pattern

### Desktop Rail
- Expanded width: `15rem`
- Collapsed width: `4.75rem`
- Persistencia em `localStorage`
- Rail fixa com icones fortes, labels so no estado expandido
- Active item = fundo branco muito sutil + texto claro

### Header
- Sticky
- mesma familia cromatica do canvas, nao branco puro
- titulo da pagina + hint operacional no canto direito
- inclui toggle do rail no desktop e sheet no mobile

### Mobile
- sidebar vira `Sheet`
- largura de referencia: `17rem`

## Card Patterns

### KPI Card
- `border-l-4` com cor semantica
- `p-4`
- label pequena, valor dominante, delta em pill no canto superior

### Summary Card
- usado em funil, distribuidores, leads quentes
- topo ou lateral com acento de cor
- helper text curto explicando o papel do numero

### Detail Cell
- bloco pequeno dentro do card principal
- label em `11px` uppercase
- valor em `text-sm font-medium`
- fundo muito suave para separar sem quebrar a leitura

## Data Grid Patterns

### Main Table Shell
- container `rounded-2xl border bg-white`
- trilho superior com busca e filtros
- tabela com `min-w-[980px]` como base
- resize de colunas ativo
- ordenacao por cabecalho
- footer com feedback da pagina atual e ajuda de uso

### Lead Table
- primeira coluna combina nome + telefone
- segunda combina empresa + CNPJ
- coluna final mostra data + motivo/path reason
- linha selecionada recebe leve tint vermelho-claro
- clique abre detalhe lateral, nao navega imediatamente

### Hot Leads Table
- ordenacao inicial por prioridade e tempo de espera
- coluna de vendedor sempre explicita ausencia de transferencia
- tempo de espera precisa combinar relativo + horas acumuladas

## Detail Pattern

### Lead Details Modal
- no desktop abre centralizado sobre a fila/tabela, nao como sheet lateral
- no mobile ocupa a tela toda para evitar cards comprimidos
- largura alvo desktop: `~1120px`, com `max-height` alto e scroll interno
- cabecalho com nome, empresa, badges e CTA para pagina dedicada
- corpo reutiliza as mesmas secoes da pagina `/leads/[id]`, com grid de duas colunas quando houver espaco

### Lead Detail Sections
- bloco 1: dados persistidos do lead
- bloco 2: qualificacao e handoff
- bloco 3: distribuidores recomendados, se houver
- bloco 4: conversa / timeline
- quando um dado nao existe na base, a interface diz isso explicitamente

## Chart Patterns

### Trend
- grade sutil, sem excesso de ruido
- legendas-resumo em chips acima do grafico
- tooltip compacto com duas series

### Path Distribution
- donut com total central
- breakdown lateral em vez de legenda solta
- cada linha combina nome, volume e participacao

### Funnel
- funil principal sempre representa apenas Path 3
- P2 aparece como desvio operacional, nunca como etapa do handoff
- cada etapa mostra:
  - volume atual
  - percentual do total
  - retencao vs etapa anterior
  - queda entre etapas

### Comparison
- comparativos usam dois recortes explicitos em cards de periodo antes do grafico
- sinais de leitura ficam em cards pequenos: maior avanco, maior queda, maior estabilidade
- cada metrica precisa mostrar periodo atual, periodo anterior e delta em pill semantica
- o grafico comparativo usa barras horizontais e mesma familia cromatica para indicar "agora" vs "antes"

## Motion
- transicoes curtas (`~200ms`)
- easing suave, sem spring
- hover e collapse do shell precisam parecer firmes, nao brincalhoes

## Validation Notes
- O novo shell, as tabelas de leads, os detalhes laterais, o funil principal, `vendedores`, `distribuidores` e `comparativos` estao alinhados com este sistema.
- Ao criar novas telas operacionais, reutilizar a mesma densidade compacta: cards `p-4/p-5`, filtros integrados ao header da secao e leitura orientada por acao.

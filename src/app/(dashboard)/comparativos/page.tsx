import { endOfDay, startOfDay } from "date-fns"
import Link from "next/link"
import {
  ArrowRightLeft,
  CalendarRange,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { ComparisonChart } from "@/components/dashboard/comparison-chart"
import {
  comparePeriods,
  type ComparisonMetric,
} from "@/lib/queries/comparisons"
import { cn } from "@/lib/utils"
import { formatDate, formatNumber, formatPercent } from "@/lib/utils/format"

interface Props {
  searchParams: Promise<{ preset?: string }>
}

function getPresetPeriods(preset: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (preset === "month") {
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    return {
      periodA: {
        from: startOfDay(thisMonthStart).toISOString(),
        to: now.toISOString(),
      },
      periodB: {
        from: startOfDay(lastMonthStart).toISOString(),
        to: endOfDay(lastMonthEnd).toISOString(),
      },
      labelA: "Este mes",
      labelB: "Mes passado",
      description:
        "Recorte mais amplo para medir consistencia do funil, handoff e qualidade media.",
    }
  }

  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - today.getDay())
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)

  return {
    periodA: {
      from: startOfDay(thisWeekStart).toISOString(),
      to: now.toISOString(),
    },
    periodB: {
      from: startOfDay(lastWeekStart).toISOString(),
      to: endOfDay(lastWeekEnd).toISOString(),
    },
    labelA: "Esta semana",
    labelB: "Semana passada",
    description:
      "Leitura curta para detectar mudancas rapidas de volume, conversao e pressao operacional.",
  }
}

export default async function ComparativosPage({ searchParams }: Props) {
  const params = await searchParams
  const preset = params.preset === "month" ? "month" : "week"
  const { periodA, periodB, labelA, labelB, description } =
    getPresetPeriods(preset)
  const metrics = await comparePeriods(periodA, periodB)
  const biggestGain = [...metrics].filter((metric) => metric.delta > 0).sort(
    (a, b) => b.delta - a.delta
  )[0]
  const biggestDrop = [...metrics].filter((metric) => metric.delta < 0).sort(
    (a, b) => a.delta - b.delta
  )[0]
  const steadiestMetric = [...metrics].sort(
    (a, b) => Math.abs(a.delta) - Math.abs(b.delta)
  )[0]
  const insightMetrics = [...metrics]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.95fr)]">
        <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-1.5 text-xs font-medium text-[#475569]">
                <CalendarRange className="h-3.5 w-3.5 text-[#B2121A]" />
                {preset === "month" ? "Leitura mensal" : "Leitura semanal"}
              </div>
              <div>
                <h2 className="text-base font-medium text-[#111827]">
                  Comparacao direta entre {labelA.toLowerCase()} e{" "}
                  {labelB.toLowerCase()}
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-[#6B7280]">
                  {description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <PeriodCard
                  label={labelA}
                  range={formatPeriodWindow(periodA.from, periodA.to)}
                  accent="#B2121A"
                />
                <PeriodCard
                  label={labelB}
                  range={formatPeriodWindow(periodB.from, periodB.to)}
                  accent="#94A3B8"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "week", label: "Semana" },
                { key: "month", label: "Mes" },
              ].map((option) => (
                <Link
                  key={option.key}
                  href={`/comparativos?preset=${option.key}`}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
                    preset === option.key
                      ? "border-[#B2121A] bg-[#B2121A] text-white"
                      : "border-[#E5E7EB] bg-[#FCFCFB] text-[#475569] hover:bg-[#F5F7FA]"
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <SignalCard
            title="Maior avanco"
            metric={biggestGain}
            tone="positive"
            fallback="Nenhum indicador acima do periodo anterior."
          />
          <SignalCard
            title="Maior queda"
            metric={biggestDrop}
            tone="negative"
            fallback="Nao houve recuo relevante neste recorte."
          />
          <SignalCard
            title="Mais estavel"
            metric={steadiestMetric}
            tone="neutral"
            fallback="Sem dados para avaliar estabilidade."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            metric={metric}
            labelA={labelA}
            labelB={labelB}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.95fr)]">
        <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#111827]">
              Pressao comparativa por indicador
            </h2>
            <p className="text-sm text-[#6B7280]">
              Barras horizontais para leitura rapida do gap entre os dois
              recortes em cada metrica principal.
            </p>
          </div>
          <div className="mt-4">
            <ComparisonChart data={metrics} labelA={labelA} labelB={labelB} />
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-5">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
              Leitura operacional
            </p>
            <h2 className="text-base font-medium text-[#111827]">
              Onde a operacao mexeu mais
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {insightMetrics.map((metric) => {
              const tone = getDeltaTone(metric.delta)

              return (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        {metric.label}
                      </p>
                      <p className="mt-1 text-xs text-[#8A94A6]">
                        {formatMetricValue(metric, metric.periodA)} agora vs{" "}
                        {formatMetricValue(metric, metric.periodB)} antes
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        tone.badgeClassName
                      )}
                    >
                      <tone.Icon className="h-3.5 w-3.5" />
                      {formatDelta(metric.delta)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] p-3">
            <p className="text-sm font-medium text-[#111827]">
              Regra de leitura
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              A coluna vermelha sempre representa o recorte atual. Use primeiro
              os deltas para detectar pressao, depois confirme no grafico quais
              indicadores sustentaram a mudanca.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function PeriodCard({
  label,
  range,
  accent,
}: {
  label: string
  range: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] p-3">
      <div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <p className="mt-3 text-sm font-medium text-[#111827]">{label}</p>
      <p className="mt-1 text-xs text-[#8A94A6]">{range}</p>
    </div>
  )
}

function SignalCard({
  title,
  metric,
  tone,
  fallback,
}: {
  title: string
  metric: ComparisonMetric | undefined
  tone: "positive" | "negative" | "neutral"
  fallback: string
}) {
  const palette =
    tone === "positive"
      ? {
          accent: "#059669",
          textClassName: "text-emerald-700",
          bgClassName: "bg-emerald-50",
          Icon: TrendingUp,
        }
      : tone === "negative"
        ? {
            accent: "#B2121A",
            textClassName: "text-[#B2121A]",
            bgClassName: "bg-red-50",
            Icon: TrendingDown,
          }
        : {
            accent: "#94A3B8",
            textClassName: "text-slate-600",
            bgClassName: "bg-slate-100",
            Icon: ArrowRightLeft,
          }

  return (
    <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <palette.Icon className={cn("h-4 w-4", palette.textClassName)} />
        <span>{title}</span>
      </div>
      <div
        className="mt-3 h-1.5 rounded-full"
        style={{ backgroundColor: palette.accent }}
      />
      {metric ? (
        <>
          <p className="mt-3 text-sm font-semibold text-[#111827]">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#111827]">
            {formatDelta(metric.delta)}
          </p>
          <p className="mt-1 text-xs text-[#8A94A6]">
            {formatMetricValue(metric, metric.periodA)} vs{" "}
            {formatMetricValue(metric, metric.periodB)}
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold text-[#111827]">
            Sem destaque
          </p>
          <p className="mt-1 text-xs text-[#8A94A6]">{fallback}</p>
        </>
      )}
      <div
        className={cn(
          "mt-3 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
          palette.bgClassName,
          palette.textClassName
        )}
      >
        {tone === "neutral" ? "Ruido baixo" : "Alerta comparativo"}
      </div>
    </Card>
  )
}

function MetricCard({
  metric,
  labelA,
  labelB,
}: {
  metric: ComparisonMetric
  labelA: string
  labelB: string
}) {
  const tone = getDeltaTone(metric.delta)

  return (
    <Card className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
            Indicador
          </p>
          <h2 className="text-base font-medium text-[#111827]">{metric.label}</h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            tone.badgeClassName
          )}
        >
          <tone.Icon className="h-3.5 w-3.5" />
          {formatDelta(metric.delta)}
        </span>
      </div>

      <div
        className="mt-3 h-1.5 rounded-full"
        style={{ backgroundColor: tone.accent }}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A94A6]">
            {labelA}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-[#111827]">
            {formatMetricValue(metric, metric.periodA)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A94A6]">
            {labelB}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-[#111827]">
            {formatMetricValue(metric, metric.periodB)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#8A94A6]">
        {metric.delta > 0
          ? "O indicador acelerou acima do periodo anterior."
          : metric.delta < 0
            ? "O indicador perdeu ritmo em relacao ao periodo anterior."
            : "O indicador permaneceu estavel entre os dois recortes."}
      </p>
    </Card>
  )
}

function getDeltaTone(delta: number) {
  if (delta > 0) {
    return {
      accent: "#059669",
      badgeClassName: "bg-emerald-50 text-emerald-700",
      Icon: TrendingUp,
    }
  }

  if (delta < 0) {
    return {
      accent: "#B2121A",
      badgeClassName: "bg-red-50 text-[#B2121A]",
      Icon: TrendingDown,
    }
  }

  return {
    accent: "#94A3B8",
    badgeClassName: "bg-slate-100 text-slate-600",
    Icon: Minus,
  }
}

function formatMetricValue(metric: ComparisonMetric, value: number) {
  return metric.format === "percent" ? formatPercent(value) : formatNumber(value)
}

function formatDelta(delta: number) {
  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`
}

function formatPeriodWindow(from: string, to: string) {
  return `${formatDate(from)} a ${formatDate(to)}`
}

import { Badge } from "@/components/ui/badge"
import { SCORE_LABELS, SCORE_COLORS } from "@/lib/utils/constants"

interface ScoreBadgeProps {
  scoreClass: string
  score?: number
}

export function ScoreBadge({ scoreClass, score }: ScoreBadgeProps) {
  return (
    <Badge variant="outline" className={SCORE_COLORS[scoreClass] ?? "bg-gray-100 text-gray-700"}>
      {SCORE_LABELS[scoreClass] ?? scoreClass}
      {score !== undefined && ` (${score})`}
    </Badge>
  )
}

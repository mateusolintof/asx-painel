import { Badge } from "@/components/ui/badge"
import { PATH_LABELS, PATH_COLORS } from "@/lib/utils/constants"

interface PathBadgeProps {
  path: 1 | 2 | 3
}

export function PathBadge({ path }: PathBadgeProps) {
  return (
    <Badge variant="outline" className={PATH_COLORS[path]}>
      {PATH_LABELS[path]}
    </Badge>
  )
}

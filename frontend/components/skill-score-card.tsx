import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { skillMeta, type CognitiveSkill } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/progress-bar'
import { cn } from '@/lib/utils'

export function SkillScoreCard({
  skill,
  score,
  delta,
}: {
  skill: CognitiveSkill
  score: number
  delta: number
}) {
  const meta = skillMeta[skill]
  const Icon = meta.icon
  const positive = delta >= 0
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`, color: meta.color }}
        >
          <Icon className="size-5" />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-semibold',
            positive ? 'text-success' : 'text-destructive',
          )}
        >
          {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(delta)}
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">{skill}</span>
        <span className="font-display text-xl font-bold">{score}</span>
      </div>
      <ProgressBar value={score} color={meta.color} className="mt-2" />
    </Card>
  )
}

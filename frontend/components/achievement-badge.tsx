import { Lock } from 'lucide-react'
import type { Achievement } from '@/lib/mock-data'
import { ProgressBar } from '@/components/progress-bar'
import { cn } from '@/lib/utils'

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border p-4 text-center transition-colors',
        achievement.unlocked ? 'border-border bg-card' : 'border-dashed border-border bg-muted/40',
      )}
    >
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-2xl',
          achievement.unlocked
            ? 'bg-gradient-to-br from-primary to-chart-5 text-primary-foreground'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {achievement.unlocked ? <Icon className="size-6" /> : <Lock className="size-5" />}
      </span>
      <p className="mt-3 text-sm font-semibold">{achievement.title}</p>
      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{achievement.description}</p>
      {!achievement.unlocked && typeof achievement.progress === 'number' && (
        <div className="mt-3 w-full">
          <ProgressBar value={achievement.progress} className="h-1.5" />
          <p className="mt-1 text-[11px] text-muted-foreground">{achievement.progress}%</p>
        </div>
      )}
    </div>
  )
}

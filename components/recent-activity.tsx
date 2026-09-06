import { skillMeta, recentActivity } from '@/lib/mock-data'

export function RecentActivity() {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {recentActivity.map((a) => {
        const meta = skillMeta[a.skill]
        const Icon = meta.icon
        return (
          <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                color: meta.color,
              }}
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.game}</p>
              <p className="text-xs text-muted-foreground">
                {a.skill} · {a.accuracy}% accuracy
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{a.score}</p>
              <p className="text-xs text-muted-foreground">{a.when}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

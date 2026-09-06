import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  delta?: number
  accent?: string
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  accent = 'var(--primary)',
  className,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0
  return (
    <Card className={cn('p-5 transition-shadow hover:shadow-md', className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex size-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `color-mix(in oklab, ${accent} 15%, transparent)`, color: accent }}
        >
          <Icon className="size-5" />
        </span>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              positive ? 'bg-success/15 text-success' : 'bg-destructive/12 text-destructive',
            )}
          >
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}
            {label.toLowerCase().includes('score') ? '' : '%'}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="font-display text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground/80">{hint}</div>}
      </div>
    </Card>
  )
}

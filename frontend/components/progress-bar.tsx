import { cn } from '@/lib/utils'

type ProgressBarProps = {
  value: number
  className?: string
  indicatorClassName?: string
  color?: string
  'aria-label'?: string
}

export function ProgressBar({
  value,
  className,
  indicatorClassName,
  color,
  ...props
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-700 ease-out', indicatorClassName)}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}

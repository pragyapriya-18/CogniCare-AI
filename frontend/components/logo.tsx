import Link from 'next/link'
import { BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  href = '/',
  className,
  showText = true,
}: {
  href?: string
  className?: string
  showText?: boolean
}) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5', className)}>
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-5 text-primary-foreground shadow-sm">
        <BrainCircuit className="size-5" />
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          Mind<span className="text-primary">Forge</span>
        </span>
      )}
    </Link>
  )
}

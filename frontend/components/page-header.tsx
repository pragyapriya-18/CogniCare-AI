import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

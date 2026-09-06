'use client'

import * as React from 'react'
import { PageHeader } from '@/components/page-header'
import { GameCard } from '@/components/game-card'
import { games, type CognitiveSkill } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const filters: ('All' | CognitiveSkill)[] = ['All', 'Memory', 'Attention', 'Focus', 'Reaction']

export default function GamesPage() {
  const [active, setActive] = React.useState<'All' | CognitiveSkill>('All')
  const filtered = active === 'All' ? games : games.filter((g) => g.skill === active)

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Cognitive Games"
        description="Pick a game to train a specific skill. Each session is scored and tracked automatically."
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              active === f
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  )
}

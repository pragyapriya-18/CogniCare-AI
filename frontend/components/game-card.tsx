'use client'

import Link from 'next/link'
import { Clock, Play } from 'lucide-react'
import type { Game } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const difficultyVariant = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'default',
} as const

export function GameCard({ game }: { game: Game }) {
  const Icon = game.icon

  const difficultyButtons = (
    gameSlug: string,
  ) => (
    <div className="mt-5 grid grid-cols-3 gap-2">
      <Button
        className="w-full"
        variant="outline"
        render={
          <Link
            href={`/games/${gameSlug}?difficulty=easy`}
          />
        }
      >
        Easy
      </Button>

      <Button
        className="w-full"
        variant="outline"
        render={
          <Link
            href={`/games/${gameSlug}?difficulty=medium`}
          />
        }
      >
        Medium
      </Button>

      <Button
        className="w-full"
        variant="outline"
        render={
          <Link
            href={`/games/${gameSlug}?difficulty=hard`}
          />
        }
      >
        Hard
      </Button>
    </div>
  )

  return (
    <Card className="group flex flex-col overflow-hidden p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <span
          className="flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `color-mix(in oklab, ${game.accent} 16%, transparent)`,
            color: game.accent,
          }}
        >
          <Icon className="size-7" />
        </span>

        <Badge variant={difficultyVariant[game.difficulty]}>
          {game.difficulty}
        </Badge>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
        {game.title}
      </h3>

      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
        {game.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
          style={{
            backgroundColor: `color-mix(in oklab, ${game.accent} 12%, transparent)`,
            color: game.accent,
          }}
        >
          {game.skill}
        </span>

        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          ~{game.estimatedMinutes} min
        </span>
      </div>

      {game.slug === 'memory-match'
        ? difficultyButtons('memory-match')
        : game.slug === 'sequence-recall'
          ? difficultyButtons('sequence-recall')
          : game.slug === 'pattern-recognition'
            ? difficultyButtons('pattern-recognition')
            : game.slug === 'focus-challenge'
  ? difficultyButtons('focus-challenge')
  : game.slug === 'reaction-test'
  ? difficultyButtons('reaction-test')
  : game.slug === 'number-recall'
    ? difficultyButtons('number-recall')
    : (
                <Button
                  className="mt-5 w-full opacity-90"
                  render={<Link href="#" />}
                >
                  <Play className="size-4" />
                  Play Now
                </Button>
              )}
    </Card>
  )
}
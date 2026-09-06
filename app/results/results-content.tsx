'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Trophy,
  Target,
  Zap,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadialScore, BarChart } from '@/components/charts'
import { lastResult } from '@/lib/mock-data'

function formatTime(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export function ResultsContent() {
  const params = useSearchParams()
  const score = Number(params.get('score')) || lastResult.score
  const accuracy = Number(params.get('accuracy')) || lastResult.accuracy
  const timeSec = Number(params.get('time')) || 168
  const moves = Number(params.get('moves')) || 12
  const avgReaction = Math.max(280, Math.round(timeSec * 1000 / Math.max(moves, 1) / 4))

  const beatsAverage = score >= lastResult.averageScore
  const feedback = beatsAverage
    ? 'Outstanding focus! You scored above your average — your memory recall is sharpening fast.'
    : 'Solid effort! Keep training daily and your recall speed will climb steadily.'

  const metrics = [
    { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: 'var(--chart-2)' },
    { icon: Zap, label: 'Avg. Reaction', value: `${avgReaction}ms`, color: 'var(--chart-4)' },
    { icon: Clock, label: 'Time Taken', value: formatTime(timeSec), color: 'var(--chart-3)' },
    { icon: RotateCcw, label: 'Moves', value: moves, color: 'var(--chart-5)' },
  ]

  const comparison = [
    { label: 'This', value: score },
    { label: 'Avg', value: lastResult.averageScore },
    { label: 'Best', value: lastResult.bestScore },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]"
      />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Logo />
        <Badge variant="success">
          <Sparkles className="size-3" />
          Session complete
        </Badge>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-chart-5 text-primary-foreground shadow-lg">
            <Trophy className="size-8" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
            {lastResult.game} Complete
          </h1>
          <p className="mt-1 text-muted-foreground">{lastResult.skill} training session</p>
        </div>

        {/* Score ring */}
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:justify-around">
            <RadialScore
              value={score}
              max={lastResult.bestScore}
              size={180}
              color="var(--primary)"
              label={<span className="font-display text-4xl font-bold">{score}</span>}
              sublabel={<span className="text-sm text-muted-foreground">points</span>}
            />
            <div className="w-full max-w-xs space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Performance vs. history</p>
              <div className="h-40">
                <BarChart data={comparison} color="var(--chart-1)" />
              </div>
              <Badge variant={beatsAverage ? 'success' : 'muted'}>
                Top {lastResult.percentile}% percentile
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <Card key={m.label} className="p-5">
                <span
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${m.color} 15%, transparent)`,
                    color: m.color,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 font-display text-xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </Card>
            )
          })}
        </div>

        {/* Feedback */}
        <Card className="mt-6 border-none bg-gradient-to-br from-primary/10 to-chart-5/10">
          <CardContent className="flex items-start gap-3 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Encouraging feedback</p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{feedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" render={<Link href="/games/memory-match" />}>
            <RotateCcw className="size-4" />
            Play Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            render={<Link href="/dashboard" />}
          >
            <LayoutDashboard className="size-4" />
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}

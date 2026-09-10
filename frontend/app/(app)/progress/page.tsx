'use client'

import * as React from 'react'
import { TrendingUp, Clock } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { SkillScoreCard } from '@/components/skill-score-card'
import { BarChart, TrendChart } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { games, skillMeta } from '@/lib/mock-data'

type Score = {
  id: number
  game_name: string
  score: number
  accuracy: number | null
  time_taken: number | null
  played_at: string
}

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const skillForGame: Record<
  string,
  'Memory' | 'Attention' | 'Focus' | 'Reaction'
> = {
  'memory-match': 'Memory',
  'sequence-recall': 'Memory',
  'number-recall': 'Memory',
  'pattern-recognition': 'Attention',
  'focus-challenge': 'Focus',
  'reaction-test': 'Reaction',
}

const skillLabels = [
  'Memory',
  'Attention',
  'Focus',
  'Reaction',
] as const

const difficultyVariant = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'default',
} as const

function getGameTitle(gameName: string) {
  const game = games.find((item) => item.slug === gameName)
  return game?.title || gameName
}

function getDifficulty(gameName: string) {
  const game = games.find((item) => item.slug === gameName)
  return game?.difficulty || null
}

function getSkillScore(
  scores: Score[],
  skill: (typeof skillLabels)[number],
) {
  const skillScores = scores.filter(
    (item) => skillForGame[item.game_name] === skill,
  )

  if (skillScores.length === 0) {
    return 0
  }

  const total = skillScores.reduce(
    (sum, item) => sum + (item.accuracy ?? 0),
    0,
  )

  return Math.round(total / skillScores.length)
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return '—'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}m ${remainingSeconds}s`
}

function getWeeklyPerformance(scores: Score[]) {
  const result = [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ]

  const now = new Date()

  scores.forEach((item) => {
    const date = new Date(item.played_at)

    const difference =
      (now.getTime() - date.getTime()) /
      (1000 * 60 * 60 * 24)

    if (difference < 0 || difference > 7) {
      return
    }

    const day = date.toLocaleDateString('en-US', {
      weekday: 'short',
    })

    const entry = result.find(
      (item) => item.label === day,
    )

    if (entry) {
      entry.value = Math.max(
        entry.value,
        item.score || 0,
      )
    }
  })

  return result
}

function getImprovementTrend(scores: Score[]) {
  const weeks = Array.from(
    { length: 8 },
    (_, index) => ({
      label: `W${index + 1}`,
      value: 0,
    }),
  )

  if (scores.length === 0) {
    return weeks
  }

  const now = new Date()

  scores.forEach((item) => {
    const date = new Date(item.played_at)

    const difference =
      (now.getTime() - date.getTime()) /
      (1000 * 60 * 60 * 24)

    if (difference < 0 || difference > 56) {
      return
    }

    const weekFromCurrent = Math.floor(
      difference / 7,
    )

    const index = 7 - weekFromCurrent

    if (index >= 0 && index < 8) {
      weeks[index].value = Math.max(
        weeks[index].value,
        item.score || 0,
      )
    }
  })

  return weeks
}

export default function ProgressPage() {
  const [scores, setScores] = React.useState<Score[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadScores() {
      try {
        const savedUser =
          localStorage.getItem('user')

        if (!savedUser) {
          setScores([])
          return
        }

        const user = JSON.parse(savedUser)

        if (!user?.id) {
          setScores([])
          return
        }

        const response = await fetch(
          `${API_URL}/api/games/scores/${user.id}`,
        )

        if (!response.ok) {
          throw new Error(
            'Failed to load scores',
          )
        }

        const data = await response.json()

        setScores(data.scores || [])
      } catch (error) {
        console.error(
          'Failed to load progress:',
          error,
        )

        setScores([])
      } finally {
        setLoading(false)
      }
    }

    loadScores()
  }, [])

  if (loading) {
    return null
  }

  const skillScores = skillLabels.map(
    (skill) => ({
      skill,
      score: getSkillScore(
        scores,
        skill,
      ),
      delta: 0,
    }),
  )

  const weeklyPerformance =
    getWeeklyPerformance(scores)

  const improvementTrend =
    getImprovementTrend(scores)

  const gameHistory = scores
    .slice()
    .sort(
      (a, b) =>
        new Date(b.played_at).getTime() -
        new Date(a.played_at).getTime(),
    )

  const trendChange =
    improvementTrend[7].value -
    improvementTrend[0].value

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Progress & Analytics"
        description="Track how each cognitive skill evolves over time and review your game history."
      />

      {/* Skill scores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skillScores.map((item) => (
          <SkillScoreCard
            key={item.skill}
            skill={item.skill}
            score={item.score}
            delta={item.delta}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              Weekly Performance
            </CardTitle>

            <Badge variant="muted">
              <Clock className="size-3" />
              7 days
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="h-56">
              <BarChart
                data={weeklyPerformance}
                color="var(--chart-2)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              Improvement Trend
            </CardTitle>

            <Badge variant="success">
              <TrendingUp className="size-3" />
              {trendChange >= 0 ? '+' : ''}
              {trendChange}
            </Badge>
          </CardHeader>

          <CardContent>
            <TrendChart
              data={improvementTrend}
              color="var(--chart-5)"
              height={224}
            />
          </CardContent>
        </Card>
      </div>

      {/* Game history */}
      <Card>
        <CardHeader>
          <CardTitle>
            Game History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {gameHistory.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No games played yet.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3 font-medium">
                        Game
                      </th>

                      <th className="pb-3 font-medium">
                        Skill
                      </th>

                      <th className="pb-3 font-medium">
                        Difficulty
                      </th>

                      <th className="pb-3 text-right font-medium">
                        Score
                      </th>

                      <th className="pb-3 text-right font-medium">
                        Accuracy
                      </th>

                      <th className="pb-3 text-right font-medium">
                        Duration
                      </th>

                      <th className="pb-3 text-right font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {gameHistory.map((item) => {
                      const skill =
                        skillForGame[
                          item.game_name
                        ] || 'Memory'

                      const difficulty =
                        getDifficulty(
                          item.game_name,
                        )

                      return (
                        <tr key={item.id}>
                          <td className="py-3 font-medium">
                            {getGameTitle(
                              item.game_name,
                            )}
                          </td>

                          <td className="py-3 text-muted-foreground">
                            {skill}
                          </td>

                          <td className="py-3">
                            {difficulty ? (
                              <Badge
                                variant={
                                  difficultyVariant[
                                    difficulty
                                  ]
                                }
                              >
                                {difficulty}
                              </Badge>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="py-3 text-right font-semibold tabular-nums">
                            {item.score || 0}
                          </td>

                          <td className="py-3 text-right tabular-nums text-muted-foreground">
                            {Math.round(
                              item.accuracy || 0,
                            )}
                            %
                          </td>

                          <td className="py-3 text-right tabular-nums text-muted-foreground">
                            {formatDuration(
                              item.time_taken,
                            )}
                          </td>

                          <td className="py-3 text-right text-muted-foreground">
                            {new Date(
                              item.played_at,
                            ).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="flex flex-col divide-y divide-border sm:hidden">
                {gameHistory.map((item) => {
                  const skill =
                    skillForGame[
                      item.game_name
                    ] || 'Memory'

                  const Icon =
                    skillMeta[skill].icon

                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${skillMeta[skill].color} 15%, transparent)`,
                          color:
                            skillMeta[skill]
                              .color,
                        }}
                      >
                        <Icon className="size-[18px]" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {getGameTitle(
                            item.game_name,
                          )}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {Math.round(
                            item.accuracy || 0,
                          )}
                          % ·{' '}
                          {formatDuration(
                            item.time_taken,
                          )}{' '}
                          ·{' '}
                          {new Date(
                            item.played_at,
                          ).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </div>

                      <span className="text-sm font-semibold tabular-nums">
                        {item.score || 0}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* Empty achievements */}
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No achievements yet. Keep playing to unlock badges.
        </CardContent>
      </Card>
    </div>
  )
}
import { TrendingUp, Clock } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { SkillScoreCard } from '@/components/skill-score-card'
import { AchievementBadge } from '@/components/achievement-badge'
import { BarChart, TrendChart } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  cognitiveScores,
  weeklyPerformance,
  improvementTrend,
  gameHistory,
  achievements,
  skillMeta,
} from '@/lib/mock-data'

const difficultyVariant = { Easy: 'success', Medium: 'warning', Hard: 'default' } as const

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Progress & Analytics"
        description="Track how each cognitive skill evolves over time and review your game history."
      />

      {/* Skill scores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cognitiveScores.map((s) => (
          <SkillScoreCard key={s.skill} skill={s.skill} score={s.score} delta={s.delta} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly Performance</CardTitle>
            <Badge variant="muted">
              <Clock className="size-3" />
              7 days
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <BarChart
                data={weeklyPerformance.map((d) => ({ label: d.day, value: d.score }))}
                color="var(--chart-2)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Improvement Trend</CardTitle>
            <Badge variant="success">
              <TrendingUp className="size-3" />
              +24 over 8 weeks
            </Badge>
          </CardHeader>
          <CardContent>
            <TrendChart data={improvementTrend} color="var(--chart-5)" height={224} />
          </CardContent>
        </Card>
      </div>

      {/* Game history */}
      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 font-medium">Game</th>
                  <th className="pb-3 font-medium">Skill</th>
                  <th className="pb-3 font-medium">Difficulty</th>
                  <th className="pb-3 text-right font-medium">Score</th>
                  <th className="pb-3 text-right font-medium">Accuracy</th>
                  <th className="pb-3 text-right font-medium">Duration</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gameHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 font-medium">{h.game}</td>
                    <td className="py-3 text-muted-foreground">{h.skill}</td>
                    <td className="py-3">
                      <Badge variant={difficultyVariant[h.difficulty]}>{h.difficulty}</Badge>
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">{h.score}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">
                      {h.accuracy}%
                    </td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">
                      {h.duration}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col divide-y divide-border sm:hidden">
            {gameHistory.map((h) => {
              const Icon = skillMeta[h.skill].icon
              return (
                <li key={h.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${skillMeta[h.skill].color} 15%, transparent)`,
                      color: skillMeta[h.skill].color,
                    }}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.game}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.accuracy}% · {h.duration} · {h.date}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{h.score}</span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Achievements */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Achievement Badges
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </div>
      </div>
    </div>
  )
}

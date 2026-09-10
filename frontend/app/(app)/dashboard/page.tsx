'use client'

import Link from 'next/link'
import * as React from 'react'
import {
  Brain,
  Flame,
  Gamepad2,
  TrendingUp,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { SkillScoreCard } from '@/components/skill-score-card'
import { RecentActivity, type RecentActivityItem } from '@/components/recent-activity'
import { BarChart, RadialScore } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { games } from '@/lib/mock-data'

type Score = {
  id: number
  game_name: string
  score: number
  accuracy: number | null
  time_taken: number | null
  played_at: string
}

type ProgressResponse = {
  user: {
    id: number
    name: string
    email: string
  }
  progress: {
    games_played: number
    average_score: number
    best_score: number
    average_accuracy: number
    total_time: number
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const skillForGame: Record<string, 'Memory' | 'Attention' | 'Focus' | 'Reaction'> = {
  'memory-match': 'Memory',
  'sequence-recall': 'Memory',
  'number-recall': 'Memory',
  'pattern-recognition': 'Attention',
  'focus-challenge': 'Focus',
  'reaction-test': 'Reaction',
}

const skillLabels = ['Memory', 'Attention', 'Focus', 'Reaction'] as const

function getSkillScore(
  scores: Score[],
  skill: (typeof skillLabels)[number]
) {
  const skillScores = scores.filter(
    (item) => skillForGame[item.game_name] === skill
  )

  if (skillScores.length === 0) {
    return 0
  }

  const total = skillScores.reduce(
    (sum, item) => sum + (item.accuracy ?? 0),
    0
  )

  return Math.round(total / skillScores.length)
}

function getStreak(scores: Score[]) {
  if (scores.length === 0) {
    return 0
  }

  const dates = Array.from(
    new Set(
      scores.map((item) => {
        const date = new Date(item.played_at)
        return date.toISOString().slice(0, 10)
      })
    )
  ).sort((a, b) => b.localeCompare(a))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const latest = new Date(`${dates[0]}T00:00:00`)

  const daysFromToday = Math.floor(
    (today.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysFromToday > 1) {
    return 0
  }

  let streak = 1

  for (let i = 1; i < dates.length; i++) {
    const current = new Date(`${dates[i - 1]}T00:00:00`)
    const previous = new Date(`${dates[i]}T00:00:00`)

    const difference = Math.floor(
      (current.getTime() - previous.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (difference === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function getWeeklyPerformance(scores: Score[]) {
  const result = [
    { day: 'Mon', score: 0 },
    { day: 'Tue', score: 0 },
    { day: 'Wed', score: 0 },
    { day: 'Thu', score: 0 },
    { day: 'Fri', score: 0 },
    { day: 'Sat', score: 0 },
    { day: 'Sun', score: 0 },
  ]

  const now = new Date()

  scores.forEach((item) => {
    const date = new Date(item.played_at)
    const difference =
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

    if (difference <= 7) {
      const day = date.toLocaleDateString('en-US', {
        weekday: 'short',
      })

      const entry = result.find((item) => item.day === day)

      if (entry) {
        entry.score = Math.max(entry.score, item.score || 0)
      }
    }
  })

  return result
}

function getGameTitle(gameName: string) {
  const game = games.find((item) => item.slug === gameName)
  return game?.title || gameName
}

export default function DashboardPage() {
  const [userName, setUserName] = React.useState('User')
  const [scores, setScores] = React.useState<Score[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setLoading(false)
      return
    }

    try {
      const parsedUser = JSON.parse(savedUser)

      setUserName(
        parsedUser.name ||
          parsedUser.firstName ||
          'User'
      )

      if (!parsedUser.id) {
        setLoading(false)
        return
      }

      Promise.all([
        fetch(`${API_URL}/api/progress/${parsedUser.id}`),
        fetch(`${API_URL}/api/games/scores/${parsedUser.id}`),
      ])
        .then(async ([progressResponse, scoresResponse]) => {
          if (!progressResponse.ok || !scoresResponse.ok) {
            throw new Error('Failed to load dashboard data')
          }

          const progressData =
            (await progressResponse.json()) as ProgressResponse

          const scoresData = await scoresResponse.json()

          setUserName(
            progressData.user?.name ||
              parsedUser.name ||
              'User'
          )

          setScores(scoresData.scores || [])
        })
        .catch(() => {
          setScores([])
        })
        .finally(() => {
          setLoading(false)
        })
    } catch {
      setScores([])
      setLoading(false)
    }
  }, [])

  const gamesCompleted = scores.length

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, item) => sum + (item.score || 0), 0) /
            scores.length
        )
      : 0

  const averageAccuracy =
    scores.length > 0
      ? Math.round(
          scores.reduce(
            (sum, item) => sum + (item.accuracy || 0),
            0
          ) / scores.length
        )
      : 0

  const streak = getStreak(scores)

  const weeklyScores = getWeeklyPerformance(scores)

  const recentActivities: RecentActivityItem[] = scores
    .slice()
    .sort(
      (a, b) =>
        new Date(b.played_at).getTime() -
        new Date(a.played_at).getTime()
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      game: getGameTitle(item.game_name),
      skill: skillForGame[item.game_name] || 'Memory',
      score: item.score || 0,
      accuracy: Math.round(item.accuracy || 0),
      when: new Date(item.played_at).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        }
      ),
    }))

  const skillScores = skillLabels.map((skill) => ({
    skill,
    score: getSkillScore(scores, skill),
    delta: 0,
  }))

  const recommended = games[0]
  const RecIcon = recommended.icon

  if (loading) {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome back, ${userName}`}
        description="Here's your cognitive training snapshot. Keep the momentum going today."
        actions={
          <div className="flex items-center gap-3">
            <VoiceInput onTranscript={handleVoiceInput} />
            <Button render={<Link href="/games/memory-match" />}>
              <Play className="size-4" />
              Start Game
            </Button>
          </div>
        }
      />

      {/* Recognized text banner */}
      {voiceText && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 flex items-center justify-between">
          <p className="text-sm font-medium">
            🎤 <strong>Recognized:</strong> &quot;{voiceText}&quot;
          </p>
          <Button variant="ghost" size="sm" onClick={() => setVoiceText("")}>
            Clear
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Cognitive Score"
          value={averageScore}
          hint="Based on your game performance"
          accent="var(--chart-1)"
        />

        <StatCard
          icon={Flame}
          label="Daily Streak"
          value={`${streak} days`}
          hint="Keep training daily"
          accent="var(--chart-4)"
        />

        <StatCard
          icon={Gamepad2}
          label="Games Completed"
          value={gamesCompleted}
          hint="Your completed games"
          accent="var(--chart-3)"
        />

        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${averageAccuracy}%`}
          hint="Average accuracy"
          accent="var(--chart-5)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cognitive score */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cognitive Score</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center">
            <RadialScore
              value={averageScore}
              max={1000}
              size={168}
              label={
                <span className="font-display text-3xl font-bold">
                  {averageScore}
                </span>
              }
              sublabel={
                <span className="text-xs text-muted-foreground">
                  out of 1000
                </span>
              }
            />

            <Badge variant="muted" className="mt-4">
              <TrendingUp className="size-3" />
              {averageAccuracy}% average accuracy
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly Performance</CardTitle>

            <Badge variant="muted">
              <Clock className="size-3" />
              Last 7 days
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="h-56">
              <BarChart 
  data={weeklyScores.map((d) => ({
    label: d.day,
    value: d.score,
  }))}
  color="var(--chart-1)" 
/>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Skill Breakdown
        </h2>

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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-chart-5 text-primary-foreground lg:col-span-1">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 size-40 rounded-full bg-primary-foreground/10 blur-2xl"
          />

          <CardContent className="relative flex h-full flex-col p-6">
            <Badge className="w-fit border-transparent bg-primary-foreground/20 text-primary-foreground">
              <Sparkles className="size-3" />
              Recommended
            </Badge>

            <span className="mt-4 flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <RecIcon className="size-6" />
            </span>

            <h3 className="mt-4 font-display text-xl font-bold">
              {recommended.title}
            </h3>

            <p className="mt-1 flex-1 text-sm text-primary-foreground/85">
              {recommended.description}
            </p>

            <Button
              variant="secondary"
              className="mt-5 w-full"
              render={
                <Link href="/games/memory-match" />
              }
            >
              <Play className="size-4" />
              Play Now
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>

            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/progress" />}
            >
              View all
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>

          <CardContent>
            <RecentActivity
              activities={recentActivities}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
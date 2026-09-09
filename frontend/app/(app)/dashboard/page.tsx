"use client";
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
import { RecentActivity } from '@/components/recent-activity'
import { BarChart, RadialScore } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {

  dashboardStats,
  cognitiveScores,
  weeklyPerformance,
  games,
} from '@/lib/mock-data'

export default function DashboardPage() {
  const [userName, setUserName] = React.useState('User')

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUserName(parsedUser.name || parsedUser.firstName || 'User')
      } catch {
        setUserName('User')
      }
    }
  }, [])
  const recommended = games[2]
  const RecIcon = recommended.icon

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome back, ${userName}`}
        description="Here's your cognitive training snapshot. Keep the momentum going today."
        actions={
          <Button render={<Link href="/games/memory-match" />}>
            <Play className="size-4" />
            Start Game
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Cognitive Score"
          value={dashboardStats.cognitiveScore}
          delta={dashboardStats.cognitiveScoreDelta}
          hint="Top 12% of trainers"
          accent="var(--chart-1)"
        />
        <StatCard
          icon={Flame}
          label="Daily Streak"
          value={`${dashboardStats.streakDays} days`}
          hint="Personal best: 21 days"
          accent="var(--chart-4)"
        />
        <StatCard
          icon={Gamepad2}
          label="Games Completed"
          value={dashboardStats.gamesCompleted}
          hint={`${dashboardStats.gamesCompletedThisWeek} this week`}
          accent="var(--chart-3)"
        />
        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${dashboardStats.overallProgress}%`}
          delta={8}
          accent="var(--chart-5)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cognitive score overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cognitive Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <RadialScore
              value={dashboardStats.cognitiveScore}
              max={1000}
              size={168}
              label={
                <span className="font-display text-3xl font-bold">
                  {dashboardStats.cognitiveScore}
                </span>
              }
              sublabel={<span className="text-xs text-muted-foreground">out of 1000</span>}
            />
            <Badge variant="success" className="mt-4">
              <TrendingUp className="size-3" />+{dashboardStats.cognitiveScoreDelta} this week
            </Badge>
          </CardContent>
        </Card>

        {/* Weekly performance */}
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
                data={weeklyPerformance.map((d) => ({ label: d.day, value: d.score }))}
                color="var(--chart-1)"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill breakdown */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Skill Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cognitiveScores.map((s) => (
            <SkillScoreCard key={s.skill} skill={s.skill} score={s.score} delta={s.delta} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended game */}
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
            <h3 className="mt-4 font-display text-xl font-bold">{recommended.title}</h3>
            <p className="mt-1 flex-1 text-sm text-primary-foreground/85">
              {recommended.description}
            </p>
            <Button
              variant="secondary"
              className="mt-5 w-full"
              render={<Link href="/games/memory-match" />}
            >
              <Play className="size-4" />
              Play Now
            </Button>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/progress" />}>
              View all
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

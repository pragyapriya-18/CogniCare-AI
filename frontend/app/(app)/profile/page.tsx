import Link from 'next/link'
import {
  Flame,
  Gamepad2,
  Clock,
  Brain,
  Mail,
  CalendarDays,
  Pencil,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { SettingsCard } from '@/components/settings-card'
import { AchievementBadge } from '@/components/achievement-badge'
import { SkillScoreCard } from '@/components/skill-score-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  user,
  dashboardStats,
  cognitiveScores,
  achievements,
} from '@/lib/mock-data'

export default function ProfilePage() {
  const unlocked = achievements.filter((a) => a.unlocked)
  const summary = [
    { icon: Flame, label: 'Day Streak', value: dashboardStats.streakDays, color: 'var(--chart-4)' },
    { icon: Gamepad2, label: 'Games Played', value: dashboardStats.gamesCompleted, color: 'var(--chart-3)' },
    { icon: Brain, label: 'Cognitive Score', value: dashboardStats.cognitiveScore, color: 'var(--chart-1)' },
    { icon: Clock, label: 'Minutes Trained', value: dashboardStats.minutesTrained, color: 'var(--chart-5)' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Profile"
        description="Manage your account, review your cognitive performance and unlocked achievements."
      />

      {/* Profile card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-chart-5" />
        <CardContent className="-mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <span className="flex size-20 items-center justify-center rounded-3xl border-4 border-card bg-gradient-to-br from-primary to-chart-5 font-display text-2xl font-bold text-primary-foreground shadow-md">
              {user.avatarInitials}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold">{user.name}</h2>
                <Badge variant="default">{user.plan}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  Member since {user.memberSince}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Pencil className="size-4" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Performance summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <span
                className="flex size-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklab, ${s.color} 15%, transparent)`,
                  color: s.color,
                }}
              >
                <Icon className="size-5" />
              </span>
              <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cognitive summary */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Cognitive Performance
            </h2>
            <Button variant="ghost" size="sm" render={<Link href="/progress" />}>
              Full analytics
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {cognitiveScores.map((s) => (
              <SkillScoreCard key={s.skill} skill={s.skill} score={s.score} delta={s.delta} />
            ))}
          </div>
        </div>

        {/* Streak highlight */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-warning/20 to-chart-4/10">
          <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-3xl bg-warning/25 text-warning-foreground">
              <Flame className="size-8 text-warning" />
            </span>
            <p className="mt-4 font-display text-4xl font-bold">{dashboardStats.streakDays}</p>
            <p className="text-sm font-medium">day streak</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Your longest streak is 21 days. Play today to keep it growing!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Achievements</CardTitle>
          <Badge variant="muted">
            {unlocked.length}/{achievements.length} unlocked
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <SettingsCard />
    </div>
  )
}

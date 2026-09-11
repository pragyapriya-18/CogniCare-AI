'use client'

import * as React from 'react'
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

import { achievements } from '@/lib/mock-data'

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cognicare-ai.onrender.com'

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

type CognitiveSkill = 'Memory' | 'Attention' | 'Focus' | 'Reaction'

const skillForGame: Record<string, CognitiveSkill> = {
  'memory-match': 'Memory',
  'sequence-recall': 'Memory',
  'number-recall': 'Memory',
  'pattern-recognition': 'Attention',
  'focus-challenge': 'Focus',
  'reaction-test': 'Reaction',
}

const skillLabels: CognitiveSkill[] = ['Memory', 'Attention', 'Focus', 'Reaction']

function getSkillScore(scores: Score[], skill: CognitiveSkill) {
  const skillScores = scores.filter((item) => skillForGame[item.game_name] === skill)

  if (skillScores.length === 0) {
    return 0
  }

  const total = skillScores.reduce((sum, item) => sum + (item.accuracy ?? 0), 0)

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
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (difference === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function getLongestStreak(scores: Score[]) {
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
  ).sort((a, b) => a.localeCompare(b))

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const previous = new Date(`${dates[i - 1]}T00:00:00`)
    const currentDate = new Date(`${dates[i]}T00:00:00`)

    const difference = Math.floor(
      (currentDate.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (difference === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false)

  const [editName, setEditName] = React.useState('')
  const [editEmail, setEditEmail] = React.useState('')

  const [profileUser, setProfileUser] = React.useState({
    name: 'User',
    email: '',
    avatarInitials: 'U',
    memberSince: '',
    plan: 'Free',
  })

  const [scores, setScores] = React.useState<Score[]>([])
  const [progress, setProgress] = React.useState<ProgressResponse['progress'] | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (!savedUser) {
      setLoading(false)
      return
    }

    let parsedUser: any = null

    try {
      parsedUser = JSON.parse(savedUser)

      const name = parsedUser.name || parsedUser.firstName || 'User'

      const initials =
        parsedUser.avatarInitials ||
        name
          .split(' ')
          .map((word: string) => word[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

      setProfileUser({
        name,
        email: parsedUser.email || '',
        avatarInitials: initials,
        memberSince: parsedUser.memberSince || '',
        plan: parsedUser.plan || 'Free',
      })
    } catch {
      setLoading(false)
      return
    }

    if (!parsedUser?.id) {
      setLoading(false)
      return
    }

    Promise.all([
      fetch(`${API_URL}/api/progress/${parsedUser.id}`),
      fetch(`${API_URL}/api/games/scores/${parsedUser.id}`),
    ])
      .then(async ([progressResponse, scoresResponse]) => {
        if (!progressResponse.ok || !scoresResponse.ok) {
          throw new Error('Failed to load profile data')
        }

        const progressData = (await progressResponse.json()) as ProgressResponse
        const scoresData = await scoresResponse.json()

        setProfileUser((prev) => ({
          ...prev,
          name: progressData.user?.name || prev.name,
        }))

        setProgress(progressData.progress)
        setScores(scoresData.scores || [])
      })
      .catch((err) => {
        console.error('Profile fetch failed:', err)
        setScores([])
        setProgress(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleEdit = () => {
    setEditName(profileUser.name)
    setEditEmail(profileUser.email)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditName('')
    setEditEmail('')
  }

  const handleSave = () => {
    const name = editName.trim()
    const email = editEmail.trim()

    if (!name || !email) {
      return
    }

    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const updatedUser = {
      ...profileUser,
      name,
      email,
      avatarInitials: initials,
    }

    setProfileUser(updatedUser)

    localStorage.setItem('user', JSON.stringify(updatedUser))

    setIsEditing(false)
  }

  const streak = getStreak(scores)
  const longestStreak = getLongestStreak(scores)

  const gamesPlayed = progress?.games_played ?? 0
  const cognitiveScore = progress ? Math.round(progress.average_score) : 0
  const minutesTrained = progress ? Math.round(progress.total_time / 60) : 0

  // Compute real unlock status / progress for achievements we have data for.
  // Achievements we can't yet measure (no backend tracking for weekly
  // per-skill improvement) are left exactly as they come from mock-data,
  // clearly still using placeholder progress until that's built.
  const memoryMatchScores = scores.filter((s) => s.game_name === 'memory-match')
  const bestMemoryScore =
    memoryMatchScores.length > 0
      ? Math.max(...memoryMatchScores.map((s) => s.score))
      : 0

  const reactionScores = scores.filter((s) => s.game_name === 'reaction-test')
  const fastestReactionSeconds =
    reactionScores.length > 0
      ? Math.min(...reactionScores.map((s) => s.time_taken ?? Infinity))
      : Infinity

  const bestAccuracy =
    scores.length > 0
      ? Math.max(...scores.map((s) => s.accuracy ?? 0))
      : 0

  const focusSessionCount = scores.filter(
    (s) => s.game_name === 'focus-challenge'
  ).length

  const computedAchievements = achievements.map((a) => {
    switch (a.id) {
      case 'a1': // 7-Day Streak
        return {
          ...a,
          unlocked: streak >= 7,
          progress: Math.min(100, Math.round((streak / 7) * 100)),
        }
      case 'a2': // Memory Master (900+ in Memory Match)
        return {
          ...a,
          unlocked: bestMemoryScore >= 900,
          progress: Math.min(100, Math.round((bestMemoryScore / 900) * 100)),
        }
      case 'a3': // Quick Draw (react under 300ms)
        return {
          ...a,
          unlocked: fastestReactionSeconds < 0.3,
          progress:
            fastestReactionSeconds === Infinity
              ? 0
              : Math.min(
                  100,
                  Math.round((0.3 / fastestReactionSeconds) * 100)
                ),
        }
      case 'a4': // Sharp Shooter (95% accuracy)
        return {
          ...a,
          unlocked: bestAccuracy >= 95,
          progress: Math.min(100, Math.round(bestAccuracy)),
        }
      case 'a5': // Focus Guru (20 focus sessions)
        return {
          ...a,
          unlocked: focusSessionCount >= 20,
          progress: Math.min(100, Math.round((focusSessionCount / 20) * 100)),
        }
      case 'a6': // Grandmaster (cognitive score 900+)
        return {
          ...a,
          unlocked: cognitiveScore >= 900,
          progress: Math.min(100, Math.round((cognitiveScore / 900) * 100)),
        }
      case 'a8': // Century Club (100 games)
        return {
          ...a,
          unlocked: gamesPlayed >= 100,
          progress: Math.min(100, Math.round((gamesPlayed / 100) * 100)),
        }
      default:
        // a7 (Rising Star) has no backend tracking yet - left untouched
        return a
    }
  })

  const unlocked = computedAchievements.filter((a) => a.unlocked)

  const summary = [
    {
      icon: Flame,
      label: 'Day Streak',
      value: streak,
      color: 'var(--chart-4)',
    },
    {
      icon: Gamepad2,
      label: 'Games Played',
      value: gamesPlayed,
      color: 'var(--chart-3)',
    },
    {
      icon: Brain,
      label: 'Cognitive Score',
      value: cognitiveScore,
      color: 'var(--chart-1)',
    },
    {
      icon: Clock,
      label: 'Minutes Trained',
      value: minutesTrained,
      color: 'var(--chart-5)',
    },
  ]

  const skillScores = skillLabels.map((skill) => ({
    skill,
    score: getSkillScore(scores, skill),
    delta: 0,
  }))

  if (loading) {
    return null
  }

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
            {/* Avatar */}
            <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl border-4 border-card bg-gradient-to-br from-primary to-chart-5 font-display text-2xl font-bold text-primary-foreground shadow-md">
              {profileUser.avatarInitials}
            </span>

            {/* Profile information */}
            {isEditing ? (
              <div className="w-full max-w-md space-y-3">
                <div>
                  <label className="text-sm font-medium">Name</label>

                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>

                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold">
                    {profileUser.name}
                  </h2>

                  <Badge variant="default">
                    {profileUser.plan}
                  </Badge>
                </div>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {profileUser.email}
                  </span>

                  {profileUser.memberSince && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      Member since {profileUser.memberSince}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit / Save / Cancel buttons */}
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                disabled={!editName.trim() || !editEmail.trim()}
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
            >
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          )}
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

              <p className="mt-3 font-display text-2xl font-bold">
                {s.value}
              </p>

              <p className="text-xs text-muted-foreground">
                {s.label}
              </p>
            </Card>
          )
        })}
      </div>

      {/* Cognitive performance + streak */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cognitive summary */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Cognitive Performance
            </h2>

            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/progress" />}
            >
              Full analytics
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {skillScores.map((s) => (
              <SkillScoreCard
                key={s.skill}
                skill={s.skill}
                score={s.score}
                delta={s.delta}
              />
            ))}
          </div>
        </div>

        {/* Streak highlight */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-warning/20 to-chart-4/10">
          <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-3xl bg-warning/25 text-warning-foreground">
              <Flame className="size-8 text-warning" />
            </span>

            <p className="mt-4 font-display text-4xl font-bold">
              {streak}
            </p>

            <p className="text-sm font-medium">
              day streak
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {longestStreak > 0
                ? `Your longest streak is ${longestStreak} days. Play today to keep it growing!`
                : 'Play today to start your streak!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Achievements</CardTitle>

          <Badge variant="muted">
            {unlocked.length}/{computedAchievements.length} unlocked
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {computedAchievements.map((a) => (
              <AchievementBadge
                key={a.id}
                achievement={a}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <SettingsCard />
    </div>
  )
}
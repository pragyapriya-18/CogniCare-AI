'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Gamepad2,
  LineChart,
  User,
  Menu,
  X,
  Play,
  Flame,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cognicare-ai.onrender.com'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/profile', label: 'Profile', icon: User },
]

type LoggedInUser = {
  id?: number
  name?: string
  firstName?: string
  email?: string
  role?: string
}

type Score = {
  played_at: string
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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + '/')

        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/12 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-chart-5/10 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Flame className="size-4 text-warning" />
        {streak}-day streak
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {streak > 0
          ? 'Keep it going — play today!'
          : 'Start training daily to build your streak.'}
      </p>

      <Button
        size="sm"
        className="mt-3 w-full"
        render={<Link href="/games/memory-match" />}
      >
        <Play className="size-3.5" />
        Quick Start
      </Button>
    </div>
  )
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const router = useRouter()

  const [currentUser, setCurrentUser] =
    React.useState<LoggedInUser | null>(null)

  const [streak, setStreak] = React.useState(0)

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (!savedUser) {
      setCurrentUser(null)
      return
    }

    let parsedUser: LoggedInUser | null = null

    try {
      parsedUser = JSON.parse(savedUser)
      setCurrentUser(parsedUser)
    } catch {
      setCurrentUser(null)
      return
    }

    if (!parsedUser?.id) {
      return
    }

    fetch(`${API_URL}/api/games/scores/${parsedUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch scores')
        return res.json()
      })
      .then((data) => {
        setStreak(getStreak(data.scores || []))
      })
      .catch((err) => {
        console.error('Streak fetch failed:', err)
        setStreak(0)
      })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const displayName =
    currentUser?.name ||
    currentUser?.firstName ||
    'User'

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-2">
        <Logo />
      </div>

      <div className="flex-1">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu
        </p>

        <NavLinks onNavigate={onNavigate} />
      </div>

      <StreakCard streak={streak} />

      <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Logout
        </button>

        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-sm font-semibold text-primary-foreground">
          {initials || 'U'}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {displayName}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {currentUser?.role === 'patient'
              ? 'Patient'
              : currentUser?.role || 'User'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (
      !savedUser &&
      pathname !== '/login' &&
      pathname !== '/register'
    ) {
      router.replace('/login')
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[272px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <Logo />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in"
          />

          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85%] border-r border-border bg-sidebar animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            <SidebarContent
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="min-w-0">
        {children}
      </main>
    </div>
  )
}
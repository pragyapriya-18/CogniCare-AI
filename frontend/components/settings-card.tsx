'use client'

import * as React from 'react'
import { Bell, Volume2, Moon, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Setting = { id: string; icon: LucideIcon; label: string; description: string; default: boolean }

const settings: Setting[] = [
  { id: 'reminders', icon: Bell, label: 'Daily reminders', description: 'Get a nudge to keep your streak alive', default: true },
  { id: 'sound', icon: Volume2, label: 'Game sounds', description: 'Play audio cues during games (coming soon)', default: true },
  { id: 'darkmode', icon: Moon, label: 'Reduced motion', description: 'Minimize animations for comfort', default: false },
  { id: 'weekly', icon: Mail, label: 'Weekly report', description: 'Email me a summary of my progress (coming soon)', default: true },
]

const STORAGE_KEY = 'mindforge-settings'

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        on ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-background shadow-sm transition-transform',
          on ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export function SettingsCard() {
  const [state, setState] = React.useState<Record<string, boolean>>(
    Object.fromEntries(settings.map((s) => [s.id, s.default])),
  )
  const [loaded, setLoaded] = React.useState(false)

  // Load saved preferences on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setState(JSON.parse(saved))
      }
    } catch {
      // Keep defaults if parsing fails
    }
    setLoaded(true)
  }, [])

  // Persist to localStorage whenever settings change (skip the initial mount)
  React.useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, loaded])

  // Actually apply "Reduced motion" globally by toggling a class on <html>,
  // which CSS can use to disable/shorten animations app-wide.
  React.useEffect(() => {
    if (!loaded) return
    document.documentElement.classList.toggle('reduce-motion', state.darkmode)
  }, [state.darkmode, loaded])

  const toggle = (id: string) => {
    setState((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {settings.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              <Toggle
                on={state[s.id]}
                label={s.label}
                onClick={() => toggle(s.id)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
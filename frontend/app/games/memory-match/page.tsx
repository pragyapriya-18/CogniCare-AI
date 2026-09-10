'use client'

import * as React from 'react'
const API_URL = 'http://127.0.0.1:5000'
import { useRouter } from 'next/navigation'
import {
  Heart,
  Star,
  Cloud,
  Sun,
  Moon,
  Zap,
  Leaf,
  Bell,
  Pause,
  Play,
  X,
  Clock,
  Trophy,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ProgressBar } from '@/components/progress-bar'
import { cn } from '@/lib/utils'

type Face = { icon: LucideIcon; color: string }

const faces: Face[] = [
  { icon: Heart, color: 'var(--chart-1)' },
  { icon: Star, color: 'var(--chart-4)' },
  { icon: Cloud, color: 'var(--chart-2)' },
  { icon: Sun, color: 'var(--warning)' },
  { icon: Moon, color: 'var(--chart-3)' },
  { icon: Zap, color: 'var(--chart-5)' },
  { icon: Leaf, color: 'var(--success)' },
  { icon: Bell, color: 'var(--primary)' },
]

type Tile = { id: number; faceIndex: number }

function orderedDeck(pairCount: number): Tile[] {
  const deck: Tile[] = []

  faces.slice(0, pairCount).forEach((_, faceIndex) => {
    deck.push({ id: faceIndex * 2, faceIndex })
    deck.push({ id: faceIndex * 2 + 1, faceIndex })
  })

  return deck
}

function buildDeck(pairCount: number): Tile[] {
  const deck = orderedDeck(pairCount)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function MemoryMatchPage() {
  const router = useRouter()
  const [difficulty, setDifficulty] = React.useState<'easy' | 'medium' | 'hard'>('easy')
  const [deck, setDeck] = React.useState<Tile[]>([])
  const [flipped, setFlipped] = React.useState<number[]>([])
  const [matched, setMatched] = React.useState<number[]>([])
  const [moves, setMoves] = React.useState(0)
  const [seconds, setSeconds] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [showExit, setShowExit] = React.useState(false)
  const [locked, setLocked] = React.useState(false)

  const totalPairs =
  difficulty === 'easy'
    ? 4
    : difficulty === 'medium'
      ? 6
      : 8
  const matchedPairs = matched.length / 2
  const score = Math.max(0, matchedPairs * 120 - moves * 8)
  const won = matchedPairs === totalPairs

  // Shuffle only on the client after mount to avoid SSR hydration mismatch
  React.useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const value = params.get('difficulty')

  const savedDifficulty = localStorage.getItem('nextDifficulty')
  const actualDifficulty = value || savedDifficulty
  const normalizedDifficulty = actualDifficulty?.toLowerCase()


  const selectedDifficulty =
    normalizedDifficulty === 'medium' || normalizedDifficulty === 'hard' ? normalizedDifficulty : 'easy'

  setDifficulty(selectedDifficulty)

  const pairCount =
    selectedDifficulty === 'easy'
      ? 4
      : selectedDifficulty === 'medium'
        ? 6
        : 8

  setDeck(buildDeck(pairCount))
}, [])

  // Timer
  React.useEffect(() => {
    if (paused || showExit || won) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [paused, showExit, won])

// Win -> save score to backend -> results
React.useEffect(() => {
  if (!won) return

  const accuracy = Math.round(
    (totalPairs / Math.max(moves, totalPairs)) * 100
  )

  const saveScore = async () => {
    try {
      const storedUser = localStorage.getItem('user')

      if (!storedUser) {
        console.error('User not found in localStorage')
        return
      }

      const user = JSON.parse(storedUser)

      const response = await fetch(`${API_URL}/api/games/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          game_name: 'memory-match',
          score: score,
          accuracy: accuracy,
          time_taken: seconds,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Backend error:', data)
        return
      }

      console.log('Score saved successfully:', data)
    } catch (error) {
      console.error('Failed to connect to backend:', error)
    }
  }

  saveScore()

  const t = setTimeout(() => {
    router.push(
      `/results?score=${score}&time=${seconds}&moves=${moves}&accuracy=${accuracy}`
    )
  }, 900)

  return () => clearTimeout(t)
}, [won, router, score, seconds, moves, totalPairs])
// AI -> predict next difficulty
React.useEffect(() => {
  if (!won) return

  const accuracy = Math.round(
    (totalPairs / Math.max(moves, totalPairs)) * 100
  )

  const predictNextDifficulty = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/difficulty/predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accuracy: accuracy,
            score: score,
            time_taken: seconds,
          }),
        }
      )

      const data = await response.json()

      console.log('AI predicted difficulty:', data.predicted_difficulty)

      localStorage.setItem(
        'nextDifficulty',
        data.predicted_difficulty
      )
    } catch (error) {
      console.error('AI difficulty prediction failed:', error)
    }
  }

  predictNextDifficulty()
}, [won, score, seconds, moves, totalPairs])




  const handleFlip = (index: number) => {
    if (locked || paused || flipped.includes(index) || matched.includes(index)) return
    const next = [...flipped, index]
    setFlipped(next)

    if (next.length === 2) {
      setMoves((m) => m + 1)
      setLocked(true)
      const [a, b] = next
      if (deck[a].faceIndex === deck[b].faceIndex) {
        setTimeout(() => {
          setMatched((prev) => [...prev, a, b])
          setFlipped([])
          setLocked(false)
        }, 450)
      } else {
        setTimeout(() => {
          setFlipped([])
          setLocked(false)
        }, 800)
      }
    }
  }

  const restart = () => {
    setDeck(
  buildDeck(
    difficulty === 'easy'
      ? 4
      : difficulty === 'medium'
        ? 6
        : 8
  )
)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setSeconds(0)
    setPaused(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* HUD */}
      <header className="glass sticky top-0 z-20 border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Logo showText={false} />
          <div className="flex items-center gap-2 sm:gap-3">
            <Stat icon={Clock} label="Time" value={formatTime(seconds)} />
            <Stat icon={Trophy} label="Score" value={score} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={paused ? 'Resume' : 'Pause'}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExit(true)}
              className="text-destructive"
            >
              <X className="size-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Memory Match</span>
          <span className="text-muted-foreground">
            {matchedPairs}/{totalPairs} pairs
          </span>
        </div>
        <ProgressBar value={(matchedPairs / totalPairs) * 100} />
      </div>

      {/* Board */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center p-4">
        <div className="grid w-full grid-cols-4 gap-2.5 sm:gap-4">
          {deck.map((tile, index) => {
            const isUp = flipped.includes(index) || matched.includes(index)
            const isMatched = matched.includes(index)
            const Face = faces[tile.faceIndex].icon
            return (
              <button
                key={tile.id}
                onClick={() => handleFlip(index)}
                disabled={won}
                aria-label={isUp ? 'Revealed card' : 'Hidden card'}
                className={cn(
                  'relative aspect-square rounded-2xl border transition-all duration-300 [transform-style:preserve-3d]',
                  isUp
                    ? 'border-border bg-card [transform:rotateY(180deg)]'
                    : 'border-transparent bg-gradient-to-br from-primary/90 to-chart-5/90 hover:brightness-105',
                  isMatched && 'ring-2 ring-success ring-offset-2 ring-offset-background',
                )}
              >
                {/* Back */}
                <span
                  className={cn(
                    'absolute inset-0 flex items-center justify-center [backface-visibility:hidden]',
                    isUp && 'opacity-0',
                  )}
                >
                  <span className="size-5 rounded-md bg-primary-foreground/40" />
                </span>
                {/* Front */}
                <span
                  className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{ color: faces[tile.faceIndex].color }}
                >
                  {isUp && <Face className="size-7 sm:size-9" />}
                </span>
              </button>
            )
          })}
        </div>
      </main>

      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 text-sm text-muted-foreground">
        <span>Moves: {moves}</span>
        <Button variant="ghost" size="sm" onClick={restart}>
          <RotateCcw className="size-3.5" />
          Restart
        </Button>
      </div>

      {/* Pause modal */}
      <Modal open={paused && !won} onClose={() => setPaused(false)} labelledBy="pause-title">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Pause className="size-7" />
          </span>
          <h2 id="pause-title" className="mt-4 font-display text-xl font-bold">
            Game Paused
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Take a breath. Your timer and score are saved.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => setPaused(false)}>
              <Play className="size-4" />
              Resume
            </Button>
            <Button variant="outline" onClick={() => setShowExit(true)}>
              Exit Game
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit modal */}
      <Modal open={showExit} onClose={() => setShowExit(false)} labelledBy="exit-title">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
            <X className="size-7" />
          </span>
          <h2 id="exit-title" className="mt-4 font-display text-xl font-bold">
            Exit game?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your current progress in this round won&apos;t be saved.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="outline" onClick={() => setShowExit(false)}>
              Keep Playing
            </Button>
            <Button variant="destructive" onClick={() => router.push('/dashboard')}>
              Exit to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
      <Icon className="size-4 text-muted-foreground" />
      <div className="leading-none">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, RotateCcw, Trophy, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cognicare-ai.onrender.com'

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
]

type Difficulty = 'easy' | 'medium' | 'hard'

const MAX_LENGTH: Record<Difficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
}

export default function SequenceRecallPage() {
  const router = useRouter()

  const [difficulty, setDifficulty] = React.useState<Difficulty>('easy')
  const [sequence, setSequence] = React.useState<number[]>([])
  const [userSequence, setUserSequence] = React.useState<number[]>([])
  const [showing, setShowing] = React.useState(false)
  const [started, setStarted] = React.useState(false)
  const [round, setRound] = React.useState(1)
  const [message, setMessage] = React.useState('Press Start to begin')
  const [active, setActive] = React.useState<number | null>(null)
  const [finished, setFinished] = React.useState(false)
  const [startTime, setStartTime] = React.useState<number | null>(null)
  const [score, setScore] = React.useState(0)

  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlDiff = params.get('difficulty')
    const savedDiff = localStorage.getItem('nextDifficulty')
    const chosen = (urlDiff || savedDiff || 'easy').toLowerCase() as Difficulty

    if (chosen === 'medium' || chosen === 'hard') {
      setDifficulty(chosen)
    } else {
      setDifficulty('easy')
    }

    return () => clearAllTimeouts()
  }, [])

  const maxLength = MAX_LENGTH[difficulty]

  const showSequence = React.useCallback((seq: number[]) => {
    clearAllTimeouts()
    setShowing(true)

    seq.forEach((color, index) => {
      const flashOn = setTimeout(() => {
        setActive(color)
        const flashOff = setTimeout(() => {
          setActive(null)
        }, 400)
        timeoutsRef.current.push(flashOff)
      }, index * 700)

      timeoutsRef.current.push(flashOn)
    })

    const finishTimeout = setTimeout(() => {
      setShowing(false)
      setMessage('Now repeat the sequence')
    }, seq.length * 700 + 200)

    timeoutsRef.current.push(finishTimeout)
  }, [])

  const syncGameData = async (finalScore: number, finalAccuracy: number) => {
    try {
      const storedUser = localStorage.getItem('user')
      const user = storedUser ? JSON.parse(storedUser) : null

      const timeTaken = startTime
        ? Number(((Date.now() - startTime) / 1000).toFixed(3))
        : 0

      const payload = {
        score: finalScore,
        accuracy: finalAccuracy,
        time_taken: timeTaken,
      }

      const requests: Promise<any>[] = [
        fetch(`${API_URL}/api/difficulty/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.predicted_difficulty) {
              localStorage.setItem('nextDifficulty', data.predicted_difficulty)
            }
          }),
      ]

      if (user?.id) {
        requests.push(
          fetch(`${API_URL}/api/games/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              game_name: 'sequence-recall',
              ...payload,
            }),
          })
        )
      }

      await Promise.allSettled(requests)
    } catch (error) {
      console.error('Failed to sync Sequence Recall data:', error)
    }
  }

  const startGame = (targetDiff: Difficulty = difficulty) => {
    clearAllTimeouts()
    const firstSequence = [Math.floor(Math.random() * 4)]

    setStartTime(Date.now())
    setScore(0)
    setSequence(firstSequence)
    setUserSequence([])
    setRound(1)
    setStarted(true)
    setFinished(false)
    setMessage('Watch the sequence carefully')
    showSequence(firstSequence)
  }

  const handleColorClick = (color: number) => {
    if (!started || showing || finished) return

    const nextUserSequence = [...userSequence, color]
    setUserSequence(nextUserSequence)

    const currentIndex = nextUserSequence.length - 1

    // Failed round
    if (color !== sequence[currentIndex]) {
      const correctInputs = nextUserSequence.length - 1
      const totalInputs = nextUserSequence.length
      const finalAccuracy =
        totalInputs > 0 ? Math.round((correctInputs / totalInputs) * 100) : 0

      const finalScore = Math.max((sequence.length - 1) * 100, 0)

      setScore(finalScore)
      setMessage('Wrong sequence! Game Over.')
      setStarted(false)
      setFinished(true)
      setActive(null)

      syncGameData(finalScore, finalAccuracy)
      return
    }

    // Finished current sequence pattern
    if (nextUserSequence.length === sequence.length) {
      // Completed difficulty target
      if (sequence.length >= maxLength) {
        const finalScore = maxLength * 100
        const finalAccuracy = 100

        setScore(finalScore)
        setMessage('Excellent! You completed this difficulty.')
        setStarted(false)
        setFinished(true)
        setActive(null)

        syncGameData(finalScore, finalAccuracy)
        return
      }

      const nextRound = round + 1
      const nextSequence = [
        ...sequence,
        Math.floor(Math.random() * 4),
      ]

      setRound(nextRound)
      setScore(sequence.length * 100)
      setUserSequence([])
      setMessage('Correct! Get ready...')
      setShowing(true)

      const delayTimeout = setTimeout(() => {
        setSequence(nextSequence)
        showSequence(nextSequence)
      }, 700)

      timeoutsRef.current.push(delayTimeout)
    }
  }

  const restart = () => {
    clearAllTimeouts()
    setSequence([])
    setUserSequence([])
    setShowing(false)
    setStarted(false)
    setRound(1)
    setActive(null)
    setFinished(false)
    setStartTime(null)
    setScore(0)
    setMessage('Press Start to begin')
  }

  const playAgain = () => {
    const saved = localStorage.getItem('nextDifficulty')
    const nextDiff = (saved || difficulty).toLowerCase() as Difficulty
    const validDiff =
      nextDiff === 'medium' || nextDiff === 'hard' ? nextDiff : 'easy'

    setDifficulty(validDiff)
    restart()
    startGame(validDiff)
  }

  const changeDifficulty = (val: Difficulty) => {
    restart()
    setDifficulty(val)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/games')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold">
              <Trophy className="size-4" />
              Score: {score}
            </div>

            <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold">
              <Clock className="size-4" />
              Round {round}/{maxLength}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Sequence Recall</h1>
          <p className="mt-2 text-muted-foreground">
            Watch the sequence and repeat it in the same order.
          </p>
        </div>

        {/* Difficulty Selectors */}
        <div className="mb-6 flex justify-center gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? 'default' : 'outline'}
              onClick={() => changeDifficulty(level)}
              disabled={started && !finished}
            >
              <span className="capitalize">{level}</span>
            </Button>
          ))}
        </div>

        {/* Game Box */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold">{message}</p>
            {started && !finished && (
              <p className="mt-1 text-sm text-muted-foreground">
                Sequence length: {sequence.length} / {maxLength}
              </p>
            )}
          </div>

          {/* Color Matrix */}
          <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
            {COLORS.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorClick(index)}
                disabled={!started || showing || finished}
                className={`
                  aspect-square rounded-3xl ${color}
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  disabled:cursor-not-allowed disabled:opacity-60
                  ${
                    active === index
                      ? 'scale-110 brightness-150 ring-4 ring-primary-foreground shadow-2xl'
                      : ''
                  }
                `}
                aria-label={`Color ${index + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="mt-8 flex justify-center gap-3">
            {!started && !finished && (
              <Button size="lg" onClick={() => startGame(difficulty)}>
                <Play className="mr-2 size-4" />
                Start Game
              </Button>
            )}

            {started && !finished && (
              <Button variant="outline" onClick={restart}>
                <RotateCcw className="mr-2 size-4" />
                Restart
              </Button>
            )}

            {finished && (
              <div className="flex gap-3">
                <Button onClick={playAgain}>
                  <RotateCcw className="mr-2 size-4" />
                  Play Again
                </Button>
                <Button variant="outline" onClick={() => router.push('/games')}>
                  Back to Games
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">How to Play</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Watch the colored sequence carefully.</li>
            <li>• Click the colors in the same order.</li>
            <li>• Each successful round adds one more color.</li>
            <li>• Easy ends at 4 colors | Medium at 6 | Hard at 8.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
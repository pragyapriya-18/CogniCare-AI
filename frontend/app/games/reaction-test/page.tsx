"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://cognicare-ai.onrender.com";

type Difficulty = "easy" | "medium" | "hard";

const settings = {
  easy: {
    rounds: 5,
    waitMin: 1200,
    waitMax: 2500,
    timeLimit: 1500,
  },
  medium: {
    rounds: 7,
    waitMin: 900,
    waitMax: 2200,
    timeLimit: 1000,
  },
  hard: {
    rounds: 10,
    waitMin: 600,
    waitMax: 1800,
    timeLimit: 700,
  },
};

export default function ReactionTestPage() {
  const router = useRouter();

  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const [round, setRound] = React.useState(1);
  const [score, setScore] = React.useState(0);
  const [lastTime, setLastTime] = React.useState<number | null>(null);
  const [times, setTimes] = React.useState<number[]>([]);
  const [finalScore, setFinalScore] = React.useState(0);

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTransitionRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const currentSettings = settings[difficulty];

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (roundTransitionRef.current) clearTimeout(roundTransitionRef.current);
  };

  const startRound = React.useCallback(
    (targetDifficulty: Difficulty = difficulty) => {
      clearAllTimers();
      setWaiting(true);
      setReady(false);
      setLastTime(null);

      const activeConfig = settings[targetDifficulty];
      const delay =
        Math.floor(
          Math.random() * (activeConfig.waitMax - activeConfig.waitMin + 1)
        ) + activeConfig.waitMin;

      timerRef.current = setTimeout(() => {
        setWaiting(false);
        setReady(true);
        startTimeRef.current = performance.now();
      }, delay);
    },
    [difficulty]
  );

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("difficulty");

    if (value === "medium" || value === "hard") {
      setDifficulty(value);
    }

    return () => clearAllTimers();
  }, []);

  // Sync with Backend (Save score + AI predict difficulty concurrently)
  React.useEffect(() => {
    if (!finished) return;

    const averageResponseTime =
      times.length > 0
        ? times.reduce((sum, time) => sum + time, 0) / times.length / 1000
        : 0;

    const accuracy = Math.round(
      (times.length / currentSettings.rounds) * 100
    );

    const syncGameResults = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        const payload = {
          accuracy,
          score: finalScore,
          time_taken: Number(averageResponseTime.toFixed(3)),
        };

        const requests: Promise<any>[] = [
          fetch(`${API_URL}/api/difficulty/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.predicted_difficulty) {
                localStorage.setItem("nextDifficulty", data.predicted_difficulty);
              }
            }),
        ];

        if (user?.id) {
          requests.push(
            fetch(`${API_URL}/api/games/submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: user.id,
                game_name: "reaction-test",
                ...payload,
              }),
            })
          );
        }

        await Promise.allSettled(requests);
      } catch (error) {
        console.error("Failed to sync reaction test data:", error);
      }
    };

    syncGameResults();
  }, [finished, finalScore, times, currentSettings.rounds]);

  const startGame = (targetDifficulty: Difficulty = difficulty) => {
    clearAllTimers();
    setStarted(true);
    setFinished(false);
    setRound(1);
    setScore(0);
    setFinalScore(0);
    setTimes([]);
    setLastTime(null);

    startRound(targetDifficulty);
  };

  const handleReaction = () => {
    if (!started || finished) return;

    // False start handling
    if (waiting) {
      clearAllTimers();
      setWaiting(false);
      setReady(false);
      setLastTime(null);

      if (round >= currentSettings.rounds) {
        setFinalScore(score);
        setFinished(true);
        setStarted(false);
      } else {
        setRound((prev) => prev + 1);
        roundTransitionRef.current = setTimeout(() => {
          startRound();
        }, 500);
      }
      return;
    }

    if (!ready || startTimeRef.current === null) {
      return;
    }

    const reactionTime = performance.now() - startTimeRef.current;
    const roundedTime = Math.round(reactionTime);

    setLastTime(roundedTime);
    setTimes((prev) => [...prev, roundedTime]);

    const points = Math.max(
      20,
      Math.round(1000 / Math.max(reactionTime, 100))
    );

    const updatedScore = score + points;
    setScore(updatedScore);
    setReady(false);

    if (round >= currentSettings.rounds) {
      setFinalScore(updatedScore);
      setFinished(true);
      setStarted(false);
      return;
    }

    roundTransitionRef.current = setTimeout(() => {
      setRound((prev) => prev + 1);
      startRound();
    }, 700);
  };

  const restart = () => {
    clearAllTimers();
    setStarted(false);
    setFinished(false);
    setWaiting(false);
    setReady(false);
    setRound(1);
    setScore(0);
    setFinalScore(0);
    setTimes([]);
    setLastTime(null);
    startTimeRef.current = null;
  };

  const playAgain = () => {
    const savedDifficulty = localStorage.getItem("nextDifficulty");
    const nextDiff = (savedDifficulty || difficulty).toLowerCase() as Difficulty;
    const validDiff =
      nextDiff === "medium" || nextDiff === "hard" ? nextDiff : "easy";

    setDifficulty(validDiff);
    startGame(validDiff);
  };

  const changeDifficulty = (value: Difficulty) => {
    restart();
    setDifficulty(value);
  };

  const averageTime =
    times.length > 0
      ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length)
      : 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/games")}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
              <Trophy className="size-4" />
              <span className="font-semibold">{score}</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
              <Zap className="size-4" />
              <span className="font-semibold">
                {round}/{currentSettings.rounds}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Reaction Test</h1>
          <p className="mt-2 text-muted-foreground">
            React as quickly as possible when the target appears.
          </p>
        </div>

        {/* Difficulty Selectors */}
        <div className="mb-6 flex justify-center gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "default" : "outline"}
              onClick={() => changeDifficulty(level)}
            >
              <span className="capitalize">{level}</span>
            </Button>
          ))}
        </div>

        {/* Game Box */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold">
              {!started
                ? "Press Start to begin"
                : finished
                ? "Test Complete!"
                : waiting
                ? "Wait..."
                : ready
                ? "CLICK NOW!"
                : "Get Ready..."}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Difficulty: <span className="capitalize font-medium">{difficulty}</span>
            </p>
          </div>

          {/* Target Arena */}
          {!finished && (
            <button
              onClick={handleReaction}
              disabled={!started}
              className={`
                mx-auto flex aspect-square w-full max-w-sm
                items-center justify-center rounded-3xl
                border-4 text-2xl font-bold
                transition-all duration-200
                ${
                  ready
                    ? "border-primary bg-primary text-primary-foreground scale-105 shadow-xl"
                    : "border-border bg-background"
                }
                ${
                  started
                    ? "cursor-pointer hover:scale-[1.02]"
                    : "cursor-not-allowed"
                }
              `}
            >
              {!started
                ? "START"
                : waiting
                ? "WAIT"
                : ready
                ? "CLICK!"
                : "GET READY"}
            </button>
          )}

          {lastTime !== null && !finished && (
            <p className="mt-5 text-center text-lg font-semibold">
              Reaction time: {lastTime} ms
            </p>
          )}

          {/* Controls */}
          <div className="mt-8 flex justify-center gap-3">
            {!started && !finished && (
              <Button size="lg" onClick={() => startGame(difficulty)}>
                Start Game
              </Button>
            )}

            {started && (
              <Button variant="outline" onClick={restart}>
                <RotateCcw className="mr-2 size-4" />
                Restart
              </Button>
            )}
          </div>

          {/* Finished State */}
          {finished && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-bold">Great Reaction! ⚡</h2>
              <p className="mt-2 text-muted-foreground">
                You completed all rounds.
              </p>

              <p className="mt-4 text-3xl font-bold">Score: {score}</p>
              <p className="mt-2 text-lg font-semibold">
                Average Reaction: {averageTime} ms
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={playAgain}>
                  <RotateCcw className="mr-2 size-4" />
                  Play Again
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/games")}
                >
                  Back to Games
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">How to Play</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Wait for the target to turn ready.</li>
            <li>• Click immediately when it appears.</li>
            <li>• Clicking early counts as a false start for that round.</li>
            <li>• Easy: 5 rounds | Medium: 7 rounds | Hard: 10 rounds.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
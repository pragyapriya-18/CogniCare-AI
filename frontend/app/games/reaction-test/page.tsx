"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [difficulty, setDifficulty] =
    React.useState<Difficulty>("easy");

  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const [round, setRound] = React.useState(1);
  const [score, setScore] = React.useState(0);
  const [lastTime, setLastTime] = React.useState<number | null>(null);
  const [times, setTimes] = React.useState<number[]>([]);

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const startTimeRef = React.useRef<number | null>(null);

  const currentSettings = settings[difficulty];

  const startRound = React.useCallback(() => {
    setWaiting(true);
    setReady(false);
    setLastTime(null);

    const delay =
      Math.floor(
        Math.random() *
          (currentSettings.waitMax -
            currentSettings.waitMin +
            1)
      ) + currentSettings.waitMin;

    timerRef.current = setTimeout(() => {
      setWaiting(false);
      setReady(true);
      startTimeRef.current = performance.now();
    }, delay);
  }, [
    currentSettings.waitMax,
    currentSettings.waitMin,
  ]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("difficulty");

    const savedDifficulty = localStorage.getItem("nextDifficulty");
    const actualDifficulty = value || savedDifficulty;
    const normalizedDifficulty = actualDifficulty?.toLowerCase();

    if (
      normalizedDifficulty === "medium" ||
      normalizedDifficulty === "hard"
    ) {
      setDifficulty(normalizedDifficulty);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Save score to backend -> then AI predicts next difficulty
  React.useEffect(() => {
    if (!finished) return;

    const averageTime =
      times.length > 0
        ? Math.round(
            times.reduce((sum, time) => sum + time, 0) / times.length
          )
        : 0;

    // No correct/wrong answers in this game, so accuracy is derived from
    // how fast the average reaction was relative to this difficulty's time limit.
    // Faster average = higher accuracy. Clamped between 0 and 100.
    const accuracy = averageTime
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              100 - (averageTime / currentSettings.timeLimit) * 100
            )
          )
        )
      : 0;

    const saveScore = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.error("User not found in localStorage");
          return;
        }

        const user = JSON.parse(storedUser);

        const response = await fetch(
          "https://cognicare-ai.onrender.com/api/games/submit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              game_name: "reaction-test",
              score: score,
              accuracy: accuracy,
              time_taken: averageTime / 1000, // convert ms to seconds
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Backend error:", data);
          return;
        }

        console.log("Score saved successfully:", data);
      } catch (error) {
        console.error("Failed to save score:", error);
      }
    };

    saveScore();

    const predictNextDifficulty = async () => {
      try {
        const response = await fetch(
          "https://cognicare-ai.onrender.com/api/difficulty/predict",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accuracy: accuracy,
              score: score,
              time_taken: averageTime / 1000,
            }),
          }
        );

        const data = await response.json();

        console.log("AI predicted difficulty:", data.predicted_difficulty);

        localStorage.setItem("nextDifficulty", data.predicted_difficulty);
      } catch (error) {
        console.error("AI difficulty prediction failed:", error);
      }
    };

    predictNextDifficulty();
  }, [finished, score, times, currentSettings.timeLimit]);

  const startGame = () => {
    setStarted(true);
    setFinished(false);
    setRound(1);
    setScore(0);
    setTimes([]);
    setLastTime(null);

    startRound();
  };

  const handleReaction = () => {
    if (!started || finished) return;

    if (waiting) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setWaiting(false);
      setReady(false);
      setLastTime(null);

      if (round >= currentSettings.rounds) {
        setFinished(true);
        setStarted(false);
      } else {
        setRound((prev) => prev + 1);
        setTimeout(() => {
          startRound();
        }, 500);
      }

      return;
    }

    if (!ready || startTimeRef.current === null) {
      return;
    }

    const reactionTime =
      performance.now() - startTimeRef.current;

    const roundedTime = Math.round(reactionTime);

    setLastTime(roundedTime);
    setTimes((prev) => [...prev, roundedTime]);

    const points = Math.max(
      20,
      Math.round(
        1000 / Math.max(reactionTime, 100)
      )
    );

    setScore((prev) => prev + points);

    setReady(false);

    if (round >= currentSettings.rounds) {
      setFinished(true);
      setStarted(false);
      return;
    }

    setTimeout(() => {
      setRound((prev) => prev + 1);
      startRound();
    }, 700);
  };

  const restart = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const savedDifficulty = localStorage.getItem("nextDifficulty");
    const nextDifficulty = savedDifficulty?.toLowerCase();

    if (
      nextDifficulty === "easy" ||
      nextDifficulty === "medium" ||
      nextDifficulty === "hard"
    ) {
      setDifficulty(nextDifficulty);
    }

    setStarted(false);
    setFinished(false);
    setWaiting(false);
    setReady(false);
    setRound(1);
    setScore(0);
    setTimes([]);
    setLastTime(null);
    startTimeRef.current = null;
  };

  const changeDifficulty = (
    value: Difficulty
  ) => {
    restart();
    setDifficulty(value);
  };

  const averageTime =
    times.length > 0
      ? Math.round(
          times.reduce(
            (sum, time) => sum + time,
            0
          ) / times.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/games")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
              <Trophy className="size-4" />
              <span className="font-semibold">
                {score}
              </span>
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
          <h1 className="text-3xl font-bold">
            Reaction Test
          </h1>

          <p className="mt-2 text-muted-foreground">
            React as quickly as possible when the
            target appears.
          </p>
        </div>

        {/* Difficulty */}
        <div className="mb-6 flex justify-center gap-2">
          <Button
            variant={
              difficulty === "easy"
                ? "default"
                : "outline"
            }
            onClick={() =>
              changeDifficulty("easy")
            }
          >
            Easy
          </Button>

          <Button
            variant={
              difficulty === "medium"
                ? "default"
                : "outline"
            }
            onClick={() =>
              changeDifficulty("medium")
            }
          >
            Medium
          </Button>

          <Button
            variant={
              difficulty === "hard"
                ? "default"
                : "outline"
            }
            onClick={() =>
              changeDifficulty("hard")
            }
          >
            Hard
          </Button>
        </div>

        {/* Game */}
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
              Difficulty:{" "}
              <span className="capitalize font-medium">
                {difficulty}
              </span>
            </p>
          </div>

          {/* Reaction Area */}
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

          {/* Last reaction */}
          {lastTime !== null && !finished && (
            <p className="mt-5 text-center text-lg font-semibold">
              Reaction time: {lastTime} ms
            </p>
          )}

          {/* Controls */}
          <div className="mt-8 flex justify-center gap-3">

            {!started && !finished && (
              <Button
                size="lg"
                onClick={startGame}
              >
                Start Game
              </Button>
            )}

            {started && (
              <Button
                variant="outline"
                onClick={restart}
              >
                <RotateCcw className="mr-2 size-4" />
                Restart
              </Button>
            )}

          </div>

          {/* Result */}
          {finished && (
            <div className="mt-8 text-center">

              <h2 className="text-2xl font-bold">
                Great Reaction! ⚡
              </h2>

              <p className="mt-2 text-muted-foreground">
                You completed all rounds.
              </p>

              <p className="mt-4 text-3xl font-bold">
                Score: {score}
              </p>

              <p className="mt-2 text-lg font-semibold">
                Average Reaction: {averageTime} ms
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Difficulty:{" "}
                <span className="capitalize">
                  {difficulty}
                </span>
              </p>

              <div className="mt-6 flex justify-center gap-3">

                <Button onClick={restart}>
                  <RotateCcw className="mr-2 size-4" />
                  Play Again
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push("/games")
                  }
                >
                  Back to Games
                </Button>

              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">
            How to Play
          </h2>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              • Wait for the target to appear.
            </li>
            <li>
              • Click immediately when it appears.
            </li>
            <li>
              • Faster reactions give higher scores.
            </li>
            <li>
              • Easy: 5 rounds.
            </li>
            <li>
              • Medium: 7 rounds.
            </li>
            <li>
              • Hard: 10 rounds.
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}
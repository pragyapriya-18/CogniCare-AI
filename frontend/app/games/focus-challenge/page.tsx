"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitGameScore, predictDifficulty } from "@/lib/api";

type Difficulty = "easy" | "medium" | "hard";

const settings = {
  easy: {
    gridSize: 3,
    rounds: 5,
    points: 100,
  },
  medium: {
    gridSize: 4,
    rounds: 7,
    points: 150,
  },
  hard: {
    gridSize: 5,
    rounds: 10,
    points: 200,
  },
};

export default function FocusChallengePage() {
  const router = useRouter();

  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [target, setTarget] = React.useState<number | null>(null);
  const [highlighted, setHighlighted] = React.useState<number | null>(null);

  const [round, setRound] = React.useState(1);
  const [score, setScore] = React.useState(0);
  const [finalScore, setFinalScore] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [message, setMessage] = React.useState("Press Start to begin");

  const flashTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSettings = settings[difficulty];

  const clearTimers = () => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
  };

  const flashTarget = React.useCallback((targetIndex: number) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);

    setTarget(targetIndex);
    setHighlighted(targetIndex);
    setMessage("Remember the target!");

    flashTimerRef.current = setTimeout(() => {
      setHighlighted(null);
      setMessage("Find the target and click it");
    }, 800);
  }, []);

  const createRound = React.useCallback(
    (targetDifficulty: Difficulty = difficulty) => {
      const activeSettings = settings[targetDifficulty];
      const totalCells = activeSettings.gridSize * activeSettings.gridSize;
      const newTarget = Math.floor(Math.random() * totalCells);
      flashTarget(newTarget);
    },
    [difficulty, flashTarget]
  );

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("difficulty");

    if (value === "medium" || value === "hard") {
      setDifficulty(value);
    }

    return () => clearTimers();
  }, []);

  // Sync results concurrently on match end
  React.useEffect(() => {
    if (!finished) return;

    const syncResults = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        const accuracy = Math.round(
          (finalScore / (currentSettings.rounds * currentSettings.points)) * 100
        );

        const tasks: Promise<any>[] = [
          predictDifficulty(accuracy, finalScore, 0).then((res) => {
            if (res?.predicted_difficulty) {
              localStorage.setItem("nextDifficulty", res.predicted_difficulty);
            }
          }),
        ];

        if (user?.id) {
          tasks.push(
            submitGameScore(
              user.id,
              "focus-challenge",
              finalScore,
              accuracy,
              0
            )
          );
        }

        await Promise.allSettled(tasks);
      } catch (error) {
        console.error("Failed to sync score or predict difficulty:", error);
      }
    };

    syncResults();
  }, [finished, finalScore, currentSettings.rounds, currentSettings.points]);

  const startGame = (targetDifficulty: Difficulty = difficulty) => {
    clearTimers();
    setScore(0);
    setFinalScore(0);
    setRound(1);
    setFinished(false);
    setStarted(true);

    createRound(targetDifficulty);
  };

  const handleCellClick = (index: number) => {
    if (!started || finished || target === null || highlighted !== null) return;

    const isCorrect = index === target;
    const updatedScore = isCorrect ? score + currentSettings.points : score;

    if (isCorrect) {
      setScore(updatedScore);
      setMessage("Correct! 🎯");
    } else {
      setMessage("Wrong! Stay focused.");
    }

    if (round >= currentSettings.rounds) {
      setFinalScore(updatedScore);
      setFinished(true);
      setStarted(false);
      return;
    }

    roundTimerRef.current = setTimeout(() => {
      setRound((prev) => prev + 1);
      createRound(difficulty);
    }, 500);
  };

  const restart = () => {
    clearTimers();
    setTarget(null);
    setHighlighted(null);
    setRound(1);
    setScore(0);
    setFinalScore(0);
    setStarted(false);
    setFinished(false);
    setMessage("Press Start to begin");
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
    setDifficulty(value);
    restart();
  };

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
              <Target className="size-4" />
              <span className="font-semibold">
                {round}/{currentSettings.rounds}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Focus Challenge</h1>
          <p className="mt-2 text-muted-foreground">
            Stay focused and find the correct target.
          </p>
        </div>

        {/* Difficulty Selectors */}
        <div className="mb-6 flex justify-center gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "default" : "outline"}
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
            <p className="mt-1 text-sm text-muted-foreground">
              Difficulty:{" "}
              <span className="font-medium capitalize">{difficulty}</span>
            </p>
          </div>

          {/* Grid */}
          <div
            className="mx-auto grid max-w-md gap-3"
            style={{
              gridTemplateColumns: `repeat(${currentSettings.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({
              length: currentSettings.gridSize * currentSettings.gridSize,
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!started || finished || highlighted !== null}
                className={`
                  aspect-square rounded-2xl border-2 bg-background transition-all duration-200
                  hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70
                  ${
                    highlighted === index
                      ? "scale-110 border-primary bg-primary text-primary-foreground shadow-lg"
                      : "border-border"
                  }
                `}
                aria-label={`Grid cell ${index + 1}`}
              >
                {highlighted === index && (
                  <Target className="mx-auto size-7" />
                )}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-8 flex justify-center gap-3">
            {!started && !finished && (
              <Button size="lg" onClick={() => startGame(difficulty)}>
                Start Game
              </Button>
            )}

            {started && !finished && (
              <Button variant="outline" onClick={restart}>
                <RotateCcw className="mr-2 size-4" />
                Restart
              </Button>
            )}
          </div>

          {/* Game Over Screen */}
          {finished && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-bold">Challenge Complete! 🎉</h2>
              <p className="mt-2 text-muted-foreground">
                Great job staying focused.
              </p>
              <p className="mt-4 text-3xl font-bold">Score: {score}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Difficulty: <span className="capitalize">{difficulty}</span>
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={playAgain}>
                  <RotateCcw className="mr-2 size-4" />
                  Play Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/games")}>
                  Back to Games
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">How to Play</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Watch the target carefully when it flashes.</li>
            <li>• Click the correct cell once it disappears.</li>
            <li>• Easy: 3×3 grid (5 rounds).</li>
            <li>• Medium: 4×4 grid (7 rounds).</li>
            <li>• Hard: 5×5 grid (10 rounds).</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
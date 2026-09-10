"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://cognicare-ai.onrender.com";

type Difficulty = "easy" | "medium" | "hard";

const patternSets: Record<
  Difficulty,
  { sequence: string[]; options: string[]; answer: string }[]
> = {
  easy: [
    {
      sequence: ["●", "○", "●", "○", "●"],
      options: ["○", "●", "■", "▲"],
      answer: "○",
    },
    {
      sequence: ["★", "☆", "★", "☆", "★"],
      options: ["☆", "★", "●", "▲"],
      answer: "☆",
    },
    {
      sequence: ["▲", "▲", "■", "▲", "▲"],
      options: ["■", "▲", "●", "○"],
      answer: "■",
    },
  ],
  medium: [
    {
      sequence: ["▲", "■", "●", "▲", "■"],
      options: ["●", "▲", "■", "★"],
      answer: "●",
    },
    {
      sequence: ["1", "3", "5", "7", "9"],
      options: ["11", "10", "12", "13"],
      answer: "11",
    },
    {
      sequence: ["◆", "◇", "◆", "◇", "◆"],
      options: ["◇", "◆", "○", "●"],
      answer: "◇",
    },
    {
      sequence: ["A", "C", "E", "G", "I"],
      options: ["K", "J", "L", "H"],
      answer: "K",
    },
    {
      sequence: ["⬆", "➡", "⬇", "⬅", "⬆"],
      options: ["➡", "⬇", "⬅", "⬆"],
      answer: "➡",
    },
  ],
  hard: [
    {
      sequence: ["2", "4", "8", "16", "32"],
      options: ["64", "48", "60", "72"],
      answer: "64",
    },
    {
      sequence: ["●", "■", "■", "●", "■", "■"],
      options: ["●", "■", "▲", "★"],
      answer: "●",
    },
    {
      sequence: ["Z", "X", "V", "T", "R"],
      options: ["P", "Q", "S", "O"],
      answer: "P",
    },
    {
      sequence: ["1", "1", "2", "3", "5"],
      options: ["8", "7", "6", "9"],
      answer: "8",
    },
    {
      sequence: ["▲", "●", "■", "▲", "●"],
      options: ["■", "▲", "●", "◆"],
      answer: "■",
    },
    {
      sequence: ["3", "6", "12", "24", "48"],
      options: ["96", "72", "84", "92"],
      answer: "96",
    },
    {
      sequence: ["☆", "★", "★", "☆", "★"],
      options: ["★", "☆", "●", "▲"],
      answer: "★",
    },
  ],
};

const POINTS_PER_ROUND = 100;

export default function PatternRecognitionPage() {
  const router = useRouter();

  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [round, setRound] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [finalScore, setFinalScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  const responseTimes = React.useRef<number[]>([]);
  const roundStartTime = React.useRef<number>(Date.now());

  const currentList = patternSets[difficulty];
  const currentPattern = currentList[round] || currentList[0];

  // Initialize difficulty from URL or localStorage
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlDiff = params.get("difficulty");
    const savedDiff = localStorage.getItem("nextDifficulty");
    const chosen = (urlDiff || savedDiff || "easy").toLowerCase() as Difficulty;

    if (chosen === "medium" || chosen === "hard") {
      setDifficulty(chosen);
    }
    roundStartTime.current = Date.now();
  }, []);

  // Save score and request AI difficulty prediction on completion
  React.useEffect(() => {
    if (!finished) return;

    const totalPossiblePoints = currentList.length * POINTS_PER_ROUND;
    const accuracy = Math.round((finalScore / totalPossiblePoints) * 100);

    const averageResponseTime =
      responseTimes.current.length > 0
        ? responseTimes.current.reduce((sum, t) => sum + t, 0) /
          responseTimes.current.length
        : 0;

    const syncGameData = async () => {
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
                game_name: "pattern-recognition",
                ...payload,
              }),
            })
          );
        }

        await Promise.allSettled(requests);
      } catch (error) {
        console.error("Failed to sync game results:", error);
      }
    };

    syncGameData();
  }, [finished, finalScore, currentList.length]);

  const handleAnswer = (answer: string) => {
    if (selected || finished) return;

    const elapsed = (Date.now() - roundStartTime.current) / 1000;
    responseTimes.current.push(elapsed);
    setSelected(answer);

    const isCorrect = answer === currentPattern.answer;
    const updatedScore = isCorrect ? score + POINTS_PER_ROUND : score;

    if (isCorrect) {
      setScore(updatedScore);
    }

    setTimeout(() => {
      if (round >= currentList.length - 1) {
        setFinalScore(updatedScore);
        setFinished(true);
      } else {
        setRound((prev) => prev + 1);
        setSelected(null);
        roundStartTime.current = Date.now();
      }
    }, 700);
  };

  const restart = (targetDiff: Difficulty = difficulty) => {
    setDifficulty(targetDiff);
    setRound(0);
    setScore(0);
    setFinalScore(0);
    setSelected(null);
    setFinished(false);
    responseTimes.current = [];
    roundStartTime.current = Date.now();
  };

  const playAgain = () => {
    const saved = localStorage.getItem("nextDifficulty");
    const next = (saved || difficulty).toLowerCase() as Difficulty;
    const valid = next === "medium" || next === "hard" ? next : "easy";
    restart(valid);
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

          <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
            <Trophy className="size-4" />
            <span className="font-semibold">{score}</span>
          </div>
        </div>

        {/* Difficulty Controls */}
        <div className="mb-6 flex justify-center gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "default" : "outline"}
              onClick={() => restart(level)}
            >
              <span className="capitalize">{level}</span>
            </Button>
          ))}
        </div>

        {/* Game Box */}
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Pattern Recognition</h1>
          <p className="mt-2 text-muted-foreground">
            Find the missing shape that completes the pattern.
          </p>

          {!finished ? (
            <>
              <div className="mt-8">
                <p className="mb-4 font-medium">
                  Round {round + 1} of {currentList.length}
                </p>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {currentPattern.sequence.map((shape, index) => (
                    <div
                      key={index}
                      className="flex size-14 items-center justify-center rounded-xl border bg-background text-2xl font-bold sm:size-16 sm:text-3xl"
                    >
                      {shape}
                    </div>
                  ))}

                  <div className="flex size-14 items-center justify-center rounded-xl border-2 border-dashed text-2xl font-bold text-muted-foreground sm:size-16 sm:text-3xl">
                    ?
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-4 font-medium">Choose the missing item:</p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {currentPattern.options.map((option) => {
                    const isSelected = selected === option;
                    const isCorrect = option === currentPattern.answer;

                    let btnVariant = "outline" as const;
                    let extraClasses = "";

                    if (selected) {
                      if (isSelected) {
                        extraClasses = isCorrect
                          ? "border-green-500 bg-green-500/10 text-green-500"
                          : "border-destructive bg-destructive/10 text-destructive";
                      }
                    }

                    return (
                      <Button
                        key={option}
                        variant={btnVariant}
                        className={`h-20 text-3xl transition-all ${extraClasses}`}
                        onClick={() => handleAnswer(option)}
                        disabled={selected !== null}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8">
              <h2 className="text-2xl font-bold">Great Job! 🎉</h2>
              <p className="mt-2 text-muted-foreground">
                Pattern Recognition complete.
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
      </div>
    </main>
  );
}
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const patterns = [
  {
    sequence: ["●", "○", "●", "○", "●"],
    options: ["○", "●", "■", "▲"],
    answer: "○",
  },
  {
    sequence: ["▲", "▲", "■", "▲", "▲"],
    options: ["▲", "■", "●", "○"],
    answer: "■",
  },
  {
    sequence: ["★", "☆", "★", "☆", "★"],
    options: ["☆", "★", "●", "▲"],
    answer: "☆",
  },
];

export default function PatternRecognitionPage() {
  const router = useRouter();

  const [round, setRound] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  const currentPattern = patterns[round];

  const handleAnswer = (answer: string) => {
    if (selected || finished) return;

    setSelected(answer);

    if (answer === currentPattern.answer) {
      setScore((prev) => prev + 100);
    }

    setTimeout(() => {
      if (round === patterns.length - 1) {
        setFinished(true);
      } else {
        setRound((prev) => prev + 1);
        setSelected(null);
      }
    }, 700);
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/games")}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
            <Trophy className="size-4" />
            <span className="font-semibold">{score}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">
            Pattern Recognition
          </h1>

          <p className="mt-2 text-muted-foreground">
            Find the missing shape that completes the pattern.
          </p>

          {!finished ? (
            <>
              <div className="mt-8">
                <p className="mb-4 font-medium">
                  Round {round + 1} of {patterns.length}
                </p>

                <div className="flex justify-center gap-3">
                  {currentPattern.sequence.map((shape, index) => (
                    <div
                      key={index}
                      className="flex size-16 items-center justify-center rounded-xl border bg-background text-3xl font-bold"
                    >
                      {shape}
                    </div>
                  ))}

                  <div className="flex size-16 items-center justify-center rounded-xl border-2 border-dashed text-3xl font-bold text-muted-foreground">
                    ?
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-4 font-medium">
                  Choose the missing shape:
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {currentPattern.options.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      className="h-20 text-3xl"
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8">
              <h2 className="text-2xl font-bold">
                Great Job! 🎉
              </h2>

              <p className="mt-2 text-muted-foreground">
                Pattern Recognition complete.
              </p>

              <p className="mt-4 text-3xl font-bold">
                Score: {score}
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={restart}>
                  <RotateCcw className="size-4" />
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
      </div>
    </main>
  );
}
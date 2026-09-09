"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

type Difficulty = "easy" | "medium" | "hard";

const settings = {
  easy: { digits: 3, rounds: 5, points: 100, time: 1500 },
  medium: { digits: 5, rounds: 7, points: 150, time: 2000 },
  hard: { digits: 7, rounds: 10, points: 200, time: 2500 },
};

function makeNumber(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export default function NumberRecallPage() {
  const router = useRouter();

  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [number, setNumber] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [showNumber, setShowNumber] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [round, setRound] = React.useState(1);
  const [score, setScore] = React.useState(0);
  const [message, setMessage] = React.useState("Press Start to begin");

const [finalScore, setFinalScore] = React.useState(0);
const responseTimes = React.useRef<number[]>([]);
const responseStartTime = React.useRef<number | null>(null);

  const current = settings[difficulty];

  React.useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("difficulty");

    if (value === "medium" || value === "hard") {
      setDifficulty(value);
    }
  }, []);

  // AI -> predict next difficulty
React.useEffect(() => {
  if (!finished) return

  const accuracy = Math.round(
  (finalScore / (current.rounds * current.points)) * 100
);

const averageResponseTime =
  responseTimes.current.length > 0
    ? responseTimes.current.reduce((sum, time) => sum + time, 0) /
      responseTimes.current.length
    : 0;
  const predictNextDifficulty = async () => {

    console.log("AI INPUT:", {
  accuracy,
  score: accuracy,
  time_taken: averageResponseTime,
});

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/difficulty/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accuracy: accuracy,
            score: score,
            time_taken: 0,
          }),
        }
      )

      const data = await response.json()

      console.log("AI predicted difficulty:", data.predicted_difficulty)

      localStorage.setItem(
        "nextDifficulty",
        data.predicted_difficulty
      )
    } catch (error) {
      console.error("AI difficulty prediction failed:", error)
    }
  }

  predictNextDifficulty()
}, [finished, score, current])

  const startRound = () => {
    const newNumber = makeNumber(current.digits);

    setNumber(newNumber);
    setAnswer("");
    setShowNumber(true);
    setMessage("Remember the number!");

    setTimeout(() => {
  setShowNumber(false);
  setMessage("Enter the number");
  responseStartTime.current = Date.now();
}, current.time);

  };
  const startGame = () => {
  setStarted(true);
  setFinished(false);
  setRound(1);
  setScore(0);
  setFinalScore(0);
  
  responseTimes.current = [];
  responseStartTime.current = null;

  startRound();
};
  const submitAnswer = () => {
    if (!started || showNumber || !answer) return;

    const correct = answer === number;

    const elapsedTime = responseStartTime.current
  ? (Date.now() - responseStartTime.current) / 1000
  : 0;

responseTimes.current.push(elapsedTime);

    const newScore = correct
  ? score + current.points
  : score;

setScore(newScore);

if (correct) {
  setMessage("Correct! 🎉");
} else {
  setMessage(`Wrong! Answer was ${number}`);
}
    if (round >= current.rounds) {
  setFinalScore(newScore);
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
  setNumber("");
  setAnswer("");
  setShowNumber(false);
  setStarted(false);
  setFinished(false);
  setRound(1);
  setScore(0);
  setFinalScore(0);

  responseTimes.current = [];
  responseStartTime.current = null;

  setMessage("Press Start to begin");
};
    const playAgain = () => {
  const savedDifficulty = localStorage.getItem("nextDifficulty");

  const nextDifficulty = savedDifficulty?.toLowerCase();

  if (
    nextDifficulty === "easy" ||
    nextDifficulty === "medium" ||
    nextDifficulty === "hard"
  ) {
    setDifficulty(nextDifficulty);
  }

  setNumber("");
  setAnswer("");
  setShowNumber(false);
  setStarted(false);
  setFinished(false);
  setRound(1);
setScore(0);
setFinalScore(0);

responseTimes.current = [];
responseStartTime.current = null;

setMessage("Press Start to begin");
};
  const changeDifficulty = (value: Difficulty) => {
    restart();
    setDifficulty(value);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
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

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Number Recall</h1>
          <p className="mt-2 text-muted-foreground">
            Remember the number and enter it after it disappears.
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          <Button
            variant={difficulty === "easy" ? "default" : "outline"}
            onClick={() => changeDifficulty("easy")}
          >
            Easy
          </Button>

          <Button
            variant={difficulty === "medium" ? "default" : "outline"}
            onClick={() => changeDifficulty("medium")}
          >
            Medium
          </Button>

          <Button
            variant={difficulty === "hard" ? "default" : "outline"}
            onClick={() => changeDifficulty("hard")}
          >
            Hard
          </Button>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold">{message}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Difficulty: <span className="font-medium capitalize">{difficulty}</span>
              {" • "}
              Round {round}/{current.rounds}
            </p>
          </div>

          <div className="mx-auto flex min-h-32 max-w-md items-center justify-center rounded-2xl border-2 border-dashed bg-background">
            {showNumber ? (
              <span className="text-5xl font-bold tracking-[0.3em]">
                {number}
              </span>
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">
                ?
              </span>
            )}
          </div>

          {started && !finished && !showNumber && (
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-3">
              <input
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitAnswer();
                }}
                maxLength={current.digits}
                inputMode="numeric"
                placeholder="Enter the number"
                className="h-14 rounded-xl border bg-background px-4 text-center text-2xl font-semibold tracking-widest outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />

              <Button
                size="lg"
                onClick={submitAnswer}
                disabled={answer.length !== current.digits}
              >
                Submit Answer
              </Button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            {!started && !finished && (
              <Button size="lg" onClick={startGame}>
                Start Game
              </Button>
            )}

            {started && !finished && (
              <Button variant="outline" onClick={playAgain}>
                <RotateCcw className="mr-2 size-4" />
                Restart
              </Button>
            )}
          </div>

          {finished && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-bold">
                Challenge Complete! 🎉
              </h2>

              <p className="mt-2 text-3xl font-bold">
                Score: {score}
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

        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">How to Play</h2>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Remember the number shown on screen.</li>
            <li>• Enter it after it disappears.</li>
            <li>• Easy: 3 digits, 5 rounds.</li>
            <li>• Medium: 5 digits, 7 rounds.</li>
            <li>• Hard: 7 digits, 10 rounds.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
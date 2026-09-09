"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { AchievementBadge } from "@/components/achievement-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProgress } from "@/lib/api";

type ProgressData = {
  average_accuracy: number;
  average_score: number | string;
  best_score: number;
  games_played: number;
  total_time: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData>({
    average_accuracy: 0,
    average_score: 0,
    best_score: 0,
    games_played: 0,
    total_time: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setError("Please log in to view your progress.");
          setLoading(false);
          return;
        }

        const user: User = JSON.parse(storedUser);

        if (!user.id) {
          setError("User information is missing.");
          setLoading(false);
          return;
        }

        const data = await getProgress(user.id);

        setProgress({
          average_accuracy: Number(data?.progress?.average_accuracy ?? 0),
          average_score: Number(data?.progress?.average_score ?? 0),
          best_score: Number(data?.progress?.best_score ?? 0),
          games_played: Number(data?.progress?.games_played ?? 0),
          total_time: Number(data?.progress?.total_time ?? 0),
        });
      } catch (err) {
        console.error("Failed to load progress:", err);
        setError("Unable to load your progress.");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const averageScore = Number(progress.average_score || 0);
  const averageAccuracy = Number(progress.average_accuracy || 0);
  const bestScore = Number(progress.best_score || 0);
  const gamesPlayed = Number(progress.games_played || 0);
  const totalTime = Number(progress.total_time || 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Progress & Analytics"
        description="Track your cognitive game performance and progress."
      />

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading your progress...
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Progress Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Games Played
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold">{gamesPlayed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold">
                  {averageScore.toFixed(0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Score
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold">{bestScore}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Accuracy
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold">
                  {averageAccuracy.toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Time + Status */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Total Time Played</CardTitle>

                <Badge variant="muted">
                  <Clock className="size-3" />
                  All time
                </Badge>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold">
                  {totalTime.toFixed(0)} sec
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Total time spent playing cognitive games.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Progress Status</CardTitle>

                <TrendingUp className="size-5 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                {gamesPlayed === 0 ? (
                  <>
                    <p className="text-xl font-semibold">
                      No games played yet
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Play your first cognitive game to start building your
                      progress.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold">
                      Keep going!
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      You have completed {gamesPlayed}{" "}
                      {gamesPlayed === 1 ? "game" : "games"}.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Empty Game History */}
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
            </CardHeader>

            <CardContent>
              {gamesPlayed === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-medium">
                    No game history yet
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Your game results will appear here after you play a
                    cognitive game.
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="font-medium">
                    {gamesPlayed} {gamesPlayed === 1 ? "game" : "games"} played
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Your overall performance is shown above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
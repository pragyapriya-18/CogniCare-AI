"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Flame,
  Gamepad2,
  TrendingUp,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SkillScoreCard } from "@/components/skill-score-card";
import { RecentActivity } from "@/components/recent-activity";
import { BarChart, RadialScore } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/VoiceInput";
import { speak } from "@/lib/voice";
import {
  dashboardStats,
  cognitiveScores,
  weeklyPerformance,
  games,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = React.useState("User");
  const [voiceText, setVoiceText] = React.useState("");

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUserName(parsedUser.name || parsedUser.firstName || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const [reminders, setReminders] = React.useState({
  medicine: false,
  water: false,
});

const handleVoiceInput = (transcript: string) => {
  const lower = transcript.toLowerCase();
  setVoiceText(transcript);

  // 1. Navigation Actions
  if (lower.includes("game") || lower.includes("play") || lower.includes("match")) {
    speak("Starting your memory exercise.", "en-IN");
    router.push("/games/memory-match");
    return;
  }

  if (lower.includes("progress") || lower.includes("score") || lower.includes("report")) {
    speak("Opening your cognitive progress report.", "en-IN");
    router.push("/progress");
    return;
  }

  // 2. Health & Routine Tracking (Saves state for caregivers)
  if (lower.includes("medicine") || lower.includes("pill") || lower.includes("dawa")) {
    setReminders((prev) => ({ ...prev, medicine: true }));
    speak("I have recorded that you took your medicine. Well done.", "en-IN");
    return;
  }

  if (lower.includes("water") || lower.includes("pani")) {
    setReminders((prev) => ({ ...prev, water: true }));
    speak("Hydration logged. Remember to drink water regularly.", "en-IN");
    return;
  }

  // 3. Fallback Conversational Response
  speak(`I heard: ${transcript}. You can ask to play a game or log your medicine.`, "en-IN");
};

  const recommended = games[2];
  const RecIcon = recommended.icon;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome back, ${userName}`}
        description="Here's your cognitive training snapshot. Keep the momentum going today."
        actions={
          <div className="flex items-center gap-3">
            <VoiceInput onTranscript={handleVoiceInput} />
            <Button render={<Link href="/games/memory-match" />}>
              <Play className="size-4" />
              Start Game
            </Button>
          </div>
        }
      />

      {/* Recognized text banner */}
      {voiceText && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 flex items-center justify-between">
          <p className="text-sm font-medium">
            🎤 <strong>Recognized:</strong> &quot;{voiceText}&quot;
          </p>
          <Button variant="ghost" size="sm" onClick={() => setVoiceText("")}>
            Clear
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Cognitive Score"
          value={dashboardStats.cognitiveScore}
          delta={dashboardStats.cognitiveScoreDelta}
          hint="Top 12% of trainers"
          accent="var(--chart-1)"
        />
        <StatCard
          icon={Flame}
          label="Daily Streak"
          value={`${dashboardStats.streakDays} days`}
          hint="Personal best: 21 days"
          accent="var(--chart-4)"
        />
        <StatCard
          icon={Gamepad2}
          label="Games Completed"
          value={dashboardStats.gamesCompleted}
          hint={`${dashboardStats.gamesCompletedThisWeek} this week`}
          accent="var(--chart-3)"
        />
        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${dashboardStats.overallProgress}%`}
          delta={8}
          accent="var(--chart-5)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cognitive Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <RadialScore
              value={dashboardStats.cognitiveScore}
              max={1000}
              size={168}
              label={
                <span className="font-display text-3xl font-bold">
                  {dashboardStats.cognitiveScore}
                </span>
              }
              sublabel={<span className="text-xs text-muted-foreground">out of 1000</span>}
            />
            <Badge variant="success" className="mt-4">
              <TrendingUp className="size-3" />+{dashboardStats.cognitiveScoreDelta} this week
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly Performance</CardTitle>
            <Badge variant="muted">
              <Clock className="size-3" />
              Last 7 days
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <BarChart
                data={weeklyPerformance.map((d) => ({ label: d.day, value: d.score }))}
                color="var(--chart-1)"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Skill Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cognitiveScores.map((s) => (
            <SkillScoreCard key={s.skill} skill={s.skill} score={s.score} delta={s.delta} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-chart-5 text-primary-foreground lg:col-span-1">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 size-40 rounded-full bg-primary-foreground/10 blur-2xl"
          />
          <CardContent className="relative flex h-full flex-col p-6">
            <Badge className="w-fit border-transparent bg-primary-foreground/20 text-primary-foreground">
              <Sparkles className="size-3" />
              Recommended
            </Badge>
            <span className="mt-4 flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <RecIcon className="size-6" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">{recommended.title}</h3>
            <p className="mt-1 flex-1 text-sm text-primary-foreground/85">
              {recommended.description}
            </p>
            <Button
              variant="secondary"
              className="mt-5 w-full"
              render={<Link href="/games/memory-match" />}
            >
              <Play className="size-4" />
              Play Now
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/progress" />}>
              View all
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import {
  Brain,
  Eye,
  Target,
  Zap,
  Grid3x3,
  ListOrdered,
  Shapes,
  Crosshair,
  Timer,
  Hash,
  type LucideIcon,
} from 'lucide-react'

export type CognitiveSkill = 'Memory' | 'Attention' | 'Focus' | 'Reaction'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Game = {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  skill: CognitiveSkill
  difficulty: Difficulty
  estimatedMinutes: number
  accent: string
}

export const skillMeta: Record<
  CognitiveSkill,
  { icon: LucideIcon; description: string; color: string }
> = {
  Memory: {
    icon: Brain,
    description: 'Retain and recall information with sharper accuracy.',
    color: 'var(--chart-1)',
  },
  Attention: {
    icon: Eye,
    description: 'Stay locked on the right signals and filter noise.',
    color: 'var(--chart-2)',
  },
  Focus: {
    icon: Target,
    description: 'Sustain deep concentration under pressure.',
    color: 'var(--chart-3)',
  },
  Reaction: {
    icon: Zap,
    description: 'Respond faster with improved reflex timing.',
    color: 'var(--chart-4)',
  },
}

export const games: Game[] = [
  {
    slug: 'memory-match',
    title: 'Memory Match',
    description: 'Flip and pair matching tiles before the clock runs out.',
    icon: Grid3x3,
    skill: 'Memory',
    difficulty: 'Easy',
    estimatedMinutes: 3,
    accent: 'var(--chart-1)',
  },
  {
    slug: 'sequence-recall',
    title: 'Sequence Recall',
    description: 'Memorize and reproduce increasingly long sequences.',
    icon: ListOrdered,
    skill: 'Memory',
    difficulty: 'Medium',
    estimatedMinutes: 4,
    accent: 'var(--chart-1)',
  },
  {
    slug: 'pattern-recognition',
    title: 'Pattern Recognition',
    description: 'Spot the rule behind evolving visual patterns.',
    icon: Shapes,
    skill: 'Attention',
    difficulty: 'Medium',
    estimatedMinutes: 5,
    accent: 'var(--chart-2)',
  },
  {
    slug: 'focus-challenge',
    title: 'Focus Challenge',
    description: 'Track the target while distractions try to break you.',
    icon: Crosshair,
    skill: 'Focus',
    difficulty: 'Hard',
    estimatedMinutes: 6,
    accent: 'var(--chart-3)',
  },
  {
    slug: 'reaction-test',
    title: 'Reaction Test',
    description: 'Tap the moment the signal changes — measure your reflex.',
    icon: Timer,
    skill: 'Reaction',
    difficulty: 'Easy',
    estimatedMinutes: 2,
    accent: 'var(--chart-4)',
  },
  {
    slug: 'number-recall',
    title: 'Number Recall',
    description: 'Hold and recall strings of numbers in working memory.',
    icon: Hash,
    skill: 'Memory',
    difficulty: 'Hard',
    estimatedMinutes: 4,
    accent: 'var(--chart-5)',
  },
]

export const user = {
  name: 'Aarav Sharma',
  firstName: 'Aarav',
  handle: '@aarav',
  email: 'aarav.sharma@example.com',
  memberSince: 'Jan 2025',
  avatarInitials: 'AS',
  plan: 'Pro Trainer',
}

export const dashboardStats = {
  cognitiveScore: 812,
  cognitiveScoreDelta: 34,
  streakDays: 12,
  gamesCompleted: 148,
  gamesCompletedThisWeek: 9,
  overallProgress: 74,
  minutesTrained: 1260,
}

export const cognitiveScores: {
  skill: CognitiveSkill
  score: number
  delta: number
}[] = [
  { skill: 'Memory', score: 84, delta: 6 },
  { skill: 'Attention', score: 71, delta: 3 },
  { skill: 'Focus', score: 66, delta: -2 },
  { skill: 'Reaction', score: 78, delta: 9 },
]

export const weeklyPerformance = [
  { day: 'Mon', score: 62, minutes: 18 },
  { day: 'Tue', score: 70, minutes: 22 },
  { day: 'Wed', score: 65, minutes: 15 },
  { day: 'Thu', score: 78, minutes: 28 },
  { day: 'Fri', score: 74, minutes: 24 },
  { day: 'Sat', score: 85, minutes: 32 },
  { day: 'Sun', score: 81, minutes: 26 },
]

export const improvementTrend = [
  { label: 'W1', value: 58 },
  { label: 'W2', value: 61 },
  { label: 'W3', value: 65 },
  { label: 'W4', value: 63 },
  { label: 'W5', value: 70 },
  { label: 'W6', value: 74 },
  { label: 'W7', value: 79 },
  { label: 'W8', value: 82 },
]

export type Activity = {
  id: string
  game: string
  skill: CognitiveSkill
  score: number
  accuracy: number
  when: string
}

export const recentActivity: Activity[] = [
  { id: '1', game: 'Memory Match', skill: 'Memory', score: 920, accuracy: 94, when: '2h ago' },
  { id: '2', game: 'Reaction Test', skill: 'Reaction', score: 780, accuracy: 88, when: '5h ago' },
  { id: '3', game: 'Pattern Recognition', skill: 'Attention', score: 640, accuracy: 81, when: 'Yesterday' },
  { id: '4', game: 'Number Recall', skill: 'Memory', score: 710, accuracy: 86, when: 'Yesterday' },
  { id: '5', game: 'Focus Challenge', skill: 'Focus', score: 560, accuracy: 74, when: '2 days ago' },
]

export type GameHistoryEntry = {
  id: string
  game: string
  skill: CognitiveSkill
  difficulty: Difficulty
  score: number
  accuracy: number
  duration: string
  date: string
}

export const gameHistory: GameHistoryEntry[] = [
  { id: 'h1', game: 'Memory Match', skill: 'Memory', difficulty: 'Easy', score: 920, accuracy: 94, duration: '2m 48s', date: 'Sep 6' },
  { id: 'h2', game: 'Reaction Test', skill: 'Reaction', difficulty: 'Easy', score: 780, accuracy: 88, duration: '1m 52s', date: 'Sep 6' },
  { id: 'h3', game: 'Pattern Recognition', skill: 'Attention', difficulty: 'Medium', score: 640, accuracy: 81, duration: '4m 30s', date: 'Sep 5' },
  { id: 'h4', game: 'Number Recall', skill: 'Memory', difficulty: 'Hard', score: 710, accuracy: 86, duration: '3m 40s', date: 'Sep 5' },
  { id: 'h5', game: 'Focus Challenge', skill: 'Focus', difficulty: 'Hard', score: 560, accuracy: 74, duration: '5m 12s', date: 'Sep 4' },
  { id: 'h6', game: 'Sequence Recall', skill: 'Memory', difficulty: 'Medium', score: 690, accuracy: 83, duration: '3m 05s', date: 'Sep 3' },
]

export type Achievement = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  unlocked: boolean
  progress?: number
}

import { Flame, Award, Star, Trophy, Sparkles, ShieldCheck } from 'lucide-react'

export const achievements: Achievement[] = [
  { id: 'a1', title: '7-Day Streak', description: 'Trained 7 days in a row', icon: Flame, unlocked: true },
  { id: 'a2', title: 'Memory Master', description: 'Score 900+ in Memory Match', icon: Brain, unlocked: true },
  { id: 'a3', title: 'Quick Draw', description: 'React under 300ms', icon: Zap, unlocked: true },
  { id: 'a4', title: 'Sharp Shooter', description: 'Hit 95% accuracy', icon: Target, unlocked: true },
  { id: 'a5', title: 'Focus Guru', description: 'Complete 20 focus sessions', icon: ShieldCheck, unlocked: false, progress: 65 },
  { id: 'a6', title: 'Grandmaster', description: 'Reach a cognitive score of 900', icon: Trophy, unlocked: false, progress: 90 },
  { id: 'a7', title: 'Rising Star', description: 'Improve every skill in a week', icon: Star, unlocked: false, progress: 50 },
  { id: 'a8', title: 'Century Club', description: 'Complete 100 games', icon: Award, unlocked: true },
]

export const badgeIcons = { Flame, Award, Star, Trophy, Sparkles, ShieldCheck }

export const lastResult = {
  game: 'Memory Match',
  skill: 'Memory' as CognitiveSkill,
  score: 920,
  accuracy: 94,
  avgReaction: 640,
  timeTaken: '2m 48s',
  bestScore: 940,
  averageScore: 720,
  percentile: 88,
  matchesFound: 8,
  totalMatches: 8,
}

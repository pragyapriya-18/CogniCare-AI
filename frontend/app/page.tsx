import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  LineChart,
  Play,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { skillMeta, type CognitiveSkill } from '@/lib/mock-data'

const features: CognitiveSkill[] = ['Memory', 'Attention', 'Focus', 'Reaction']

const stats = [
  { label: 'Brain games', value: '6+' },
  { label: 'Skills tracked', value: '4' },
  { label: 'Avg. improvement', value: '32%' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="default" className="mb-5">
              <Sparkles className="size-3" />
              Smart Cognitive Training
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Train Your Mind.{' '}
              <span className="bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">
                Strengthen Your Memory.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              MindForge helps you sharpen memory, attention, concentration and reaction through
              interactive brain games — with personalized progress tracking that shows exactly how
              you improve over time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/games/memory-match" />}>
                <Play className="size-4" />
                Start Playing
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/progress" />}>
                <LineChart className="size-4" />
                View Progress
              </Button>
            </div>
            <dl className="mt-10 flex gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold">{s.value}</dd>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-6 -z-10 rounded-full bg-primary/15 blur-3xl"
            />
            <Card className="overflow-hidden border-border/70 p-2 shadow-xl">
              <Image
                src="/brain-hero.png"
                alt="Illustration of a glowing neural network representing cognitive training"
                width={720}
                height={720}
                priority
                className="h-auto w-full rounded-[1.4rem]"
              />
            </Card>
            <Card className="glass absolute -bottom-4 -left-4 hidden items-center gap-3 p-3 sm:flex">
              <span className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
                <Activity className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">+34 pts</p>
                <p className="text-xs text-muted-foreground">Cognitive score this week</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Four core skills, one focused workout
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Every game targets a specific cognitive domain. Together they build a balanced,
            measurable training routine.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((skill) => {
            const meta = skillMeta[skill]
            const Icon = meta.icon
            return (
              <Card key={skill} className="p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <span
                  className="flex size-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                    color: meta.color,
                  }}
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{skill}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {meta.description}
                </p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-chart-5 p-8 text-primary-foreground sm:p-12">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 size-56 rounded-full bg-primary-foreground/10 blur-2xl"
          />
          <div className="relative max-w-xl">
            <ShieldCheck className="size-8" />
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Ready to build a sharper, faster mind?
            </h2>
            <p className="mt-2 text-primary-foreground/85 text-pretty">
              Jump into the dashboard, pick a game and start tracking measurable improvement today.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-6"
              render={<Link href="/dashboard" />}
            >
              Go to Dashboard
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            MindForge — Smart India Hackathon prototype. Built for cognitive wellness.
          </p>
        </div>
      </footer>
    </div>
  )
}

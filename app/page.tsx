import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Psychometrics",
    description: "MBTI + TKI to personalize your learning and AI tone.",
  },
  {
    title: "Learning OS",
    description: "Curated courses + AI-generated paths you can actually finish.",
  },
  {
    title: "AI Notes",
    description: "Highlight text to summarize, simplify, and extract action items.",
  },
  {
    title: "Gamification",
    description: "Points, streaks, badges, and a global leaderboard—free forever.",
  },
  {
    title: "Daily AI News",
    description: "A lightweight NewsAPI carousel with caching.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Finally a learning app that feels like a calm workspace, not a noisy feed.",
    name: "Fatima · Product",
  },
  {
    quote:
      "The MBTI/TKI personalization makes the AI outputs feel like they were written for me.",
    name: "Omar · Developer",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-sm font-semibold tracking-tight">The AI Work App</div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/docs">Docs</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/onboarding">Start free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Personalized AI learning for your type.
            </h1>
            <p className="max-w-prose text-sm leading-6 text-muted-foreground">
              A minimalist, Notion-style professional development platform that uses
              MBTI + TKI to generate better learning paths—and better AI writing.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/onboarding">Start onboarding</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="glass rounded-2xl p-4">
                <div className="text-xs font-medium text-muted-foreground">Example</div>
                <div className="mt-2 text-sm font-medium">INTJ</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Direct, structured summaries. No fluff.
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <div className="text-xs font-medium text-muted-foreground">Example</div>
                <div className="mt-2 text-sm font-medium">ENFP</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Encouraging action items with momentum.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-3xl p-6">
              <div className="text-xs font-medium text-muted-foreground">Free forever</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                Build your learning operating system.
              </div>
              <div className="mt-2 text-sm leading-6 text-muted-foreground">
                Assess → Curate → Take notes → Earn points → Stay consistent.
              </div>
              <div className="mt-6 grid gap-3">
                <Button asChild>
                  <Link href="/onboarding">Get started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/notes">Try the notes editor</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">20+ LinkedIn courses</CardTitle>
                  <CardDescription>
                    Curated library with direct links.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI News carousel</CardTitle>
                  <CardDescription>
                    Cached, lightweight, and focused.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-sm font-medium text-muted-foreground">Core features</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="glass rounded-2xl p-5">
                <div className="text-sm font-medium">{feature.title}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="text-sm font-medium">Social proof</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Built for professionals in Egypt, expanding across MENA.
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-background/60 p-4">
                <div className="text-2xl font-semibold tracking-tight">1,000+</div>
                <div className="text-xs text-muted-foreground">Learners onboarded</div>
              </div>
              <div className="rounded-xl border bg-background/60 p-4">
                <div className="text-2xl font-semibold tracking-tight">4.9★</div>
                <div className="text-xs text-muted-foreground">Average rating</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="text-sm font-medium">Testimonials</div>
            <div className="mt-4 space-y-4">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-xl border bg-background/60 p-4">
                  <div className="text-sm">“{t.quote}”</div>
                  <div className="mt-2 text-xs text-muted-foreground">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Quick answers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground">What is MBTI?</div>
                <div className="mt-1">
                  A 4-dimension model (E/I, S/N, T/F, J/P) for communication preferences.
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground">What is TKI?</div>
                <div className="mt-1">
                  A conflict-style framework with five modes (competing, collaborating, compromising, avoiding, accommodating).
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground">Why is it free?</div>
                <div className="mt-1">
                  We’re optimizing for distribution and long-term trust.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-16 border-t pt-8 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>© {new Date().getFullYear()} The AI Work App</div>
            <div className="flex gap-3">
              <Link className="hover:underline" href="/docs">
                Docs
              </Link>
              <Link className="hover:underline" href="/login">
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

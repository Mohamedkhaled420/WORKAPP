import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-24">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            The AI Work App
          </h1>
          <p className="max-w-prose text-sm leading-6 text-muted-foreground">
            A minimalist, Notion-style learning operating system for ambitious
            professionals—powered by psychometrics and AI.
          </p>
        </header>

        <section className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/onboarding">Start onboarding</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">View technical docs</Link>
          </Button>
        </section>

        <section className="rounded-lg border bg-card p-6 text-sm text-card-foreground">
          <div className="space-y-2">
            <p className="font-medium">What’s wired up in this scaffold</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Shadcn/UI foundation + Tailwind tokens</li>
              <li>Supabase schema stub (users, assessments, learning_paths)</li>
              <li>TKI scoring utility for future onboarding</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

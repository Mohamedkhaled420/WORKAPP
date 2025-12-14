import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-24">
        <header className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Onboarding
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Coming next: MBTI + TKI wizard
          </h1>
          <p className="max-w-prose text-sm leading-6 text-muted-foreground">
            This route is a placeholder for the multi-step onboarding flow.
          </p>
        </header>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";

import { OnboardingWizard } from "./OnboardingWizard";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-24">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Onboarding</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Build your profile
            </h1>
          </div>

          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </header>

        <OnboardingWizard />
      </main>
    </div>
  );
}

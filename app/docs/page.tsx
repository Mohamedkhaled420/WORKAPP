import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-24">
        <header className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Technical docs
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Project scaffold
          </h1>
        </header>

        <section className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Supabase schema</span>
            : see <code className="rounded bg-muted px-1.5 py-0.5">supabase/schema.sql</code>
            .
          </p>
          <p>
            <span className="font-medium text-foreground">TKI utility</span>: see{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">lib/tki.ts</code>
            .
          </p>
        </section>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

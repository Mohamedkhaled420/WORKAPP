import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { NewLearningPathForm } from "./NewLearningPathForm";

export const dynamic = "force-dynamic";

export default async function LearningPathsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Learning paths</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Set Supabase env vars to enable learning paths.
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </main>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Learning paths</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Sign in to generate and save learning paths.
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { data: paths } = await supabase
    .from("learning_paths")
    .select("id,title,goal,created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-24">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Learning OS</p>
            <h1 className="text-3xl font-semibold tracking-tight">Learning paths</h1>
            <p className="text-sm text-muted-foreground">
              Generate a curriculum, then click into modules and lessons.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Generate a new path</CardTitle>
            <CardDescription>
              Uses the Vercel AI SDK when an API key is present.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewLearningPathForm />
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Your paths</h2>
          <div className="grid gap-3">
            {paths?.length ? (
              paths.map((p) => (
                <Link
                  key={p.id}
                  href={`/learning-paths/${p.id}`}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="text-sm font-medium">{p.title ?? p.goal}</div>
                  <div className="text-xs text-muted-foreground">{p.goal}</div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                No learning paths yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

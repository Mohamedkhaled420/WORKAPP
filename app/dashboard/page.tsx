import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Set Supabase env vars to enable auth and persistence.
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </main>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            You’re not signed in.
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("mbti_type,onboarding_completed")
    .eq("id", data.user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-24">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {profile?.onboarding_completed
                ? `Profile: ${profile.mbti_type ?? "—"}`
                : "Complete onboarding to personalize AI."}
            </p>
          </div>

          <div className="flex gap-3">
            {!profile?.onboarding_completed ? (
              <Button asChild>
                <Link href="/onboarding">Finish onboarding</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Learning paths</CardTitle>
              <CardDescription>
                Generate AI curricula and track progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/learning-paths">Open</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Notion-style editor with an AI highlight toolbar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/notes">Open</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

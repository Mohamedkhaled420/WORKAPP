import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateStreak } from "@/lib/gamification";

import { DashboardNews } from "./DashboardNews";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
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
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
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

  await updateStreak(supabase, auth.user.id);

  const { data: profile } = await supabase
    .from("users")
    .select(
      "username,avatar_url,role,mbti_type,tki_dominant_mode,total_points,current_streak,onboarding_completed",
    )
    .eq("id", auth.user.id)
    .maybeSingle();

  const { count: pathsCount } = await supabase
    .from("learning_paths")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  const { count: notesCount } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  const { count: badgesCount } = await supabase
    .from("user_badges")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Hello{" "}
              <span className="text-foreground">
                {profile?.username ?? auth.user.email ?? ""}
              </span>
              {profile?.mbti_type ? ` — ${profile.mbti_type}` : ""}
              {profile?.tki_dominant_mode ? ` · ${profile.tki_dominant_mode}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!profile?.onboarding_completed ? (
              <Button asChild>
                <Link href="/onboarding">Finish onboarding</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/learning-paths">Learning paths</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/notes">Notes</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/logout">Sign out</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                {profile?.role ? `${profile.role} · ` : ""}Personalization powered by
                MBTI + TKI.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">MBTI</div>
                  <div className="mt-1 font-medium">
                    {profile?.mbti_type ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">TKI</div>
                  <div className="mt-1 font-medium">
                    {profile?.tki_dominant_mode ?? "—"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: highlight text inside notes to use AI transforms.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gamification</CardTitle>
              <CardDescription>Momentum, not pressure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Total points</div>
                <div className="font-medium">{profile?.total_points ?? 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Current streak</div>
                <div className="font-medium">{profile?.current_streak ?? 0} days</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Badges</div>
                <div className="font-medium">{badgesCount ?? 0}</div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/leaderboard">Leaderboard</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs font-medium text-muted-foreground">Learning paths</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {pathsCount ?? 0}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs font-medium text-muted-foreground">Notes</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {notesCount ?? 0}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs font-medium text-muted-foreground">Badges</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {badgesCount ?? 0}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardNews />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Explore the app.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/learning-paths">Create a learning path</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/notes">Open notes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/achievements">Achievements</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

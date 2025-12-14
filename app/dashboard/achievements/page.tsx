import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BadgeRow = {
  id: string;
  name: string;
  description: string | null;
  points_reward: number;
  earned_at?: string | null;
};

export default async function AchievementsPage() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Set Supabase env vars to enable achievements.
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
          <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Sign in to view your badges.
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

  const { data: badges } = await supabase
    .from("badges")
    .select("id,name,description,points_reward")
    .order("created_at", { ascending: true });

  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id,earned_at")
    .eq("user_id", auth.user.id);

  const earnedById = new Map(
    (earned ?? []).map((e) => [e.badge_id as string, e.earned_at as string]),
  );

  const rows: BadgeRow[] = (badges ?? []).map((b) => ({
    ...b,
    earned_at: earnedById.get(b.id) ?? null,
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Gamification</p>
            <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.length ? (
            rows.map((badge) => (
              <Card key={badge.id} className={badge.earned_at ? "" : "opacity-80"}>
                <CardHeader>
                  <CardTitle className="text-base">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">Reward</div>
                    <div className="font-medium">+{badge.points_reward} pts</div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {badge.earned_at
                      ? `Unlocked ${new Date(badge.earned_at).toLocaleDateString()}`
                      : "Locked"}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No badges yet</CardTitle>
                <CardDescription>
                  Seed the database with badges to start earning.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

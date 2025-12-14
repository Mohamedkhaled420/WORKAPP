import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LeaderboardRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  mbti_type: string | null;
  total_points: number;
  current_streak: number;
  badges_earned: number;
  global_rank: number;
};

export default async function LeaderboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Set Supabase env vars to enable the leaderboard.
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
          <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Sign in to view the leaderboard.
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

  const { data: rows } = await supabase.rpc("get_leaderboard", { limit_count: 50 });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Gamification</p>
            <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Ranking is based on total points.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Top learners</CardTitle>
            <CardDescription>Last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {(rows as unknown as LeaderboardRow[] | null)?.length ? (
                (rows as unknown as LeaderboardRow[]).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-lg border bg-background/60 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-xs font-medium text-muted-foreground">
                        #{row.global_rank}
                      </div>
                      <div>
                        <div className="font-medium">
                          {row.username ?? row.id.slice(0, 6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.mbti_type ?? "—"} · {row.badges_earned} badges
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{row.total_points} pts</div>
                      <div className="text-xs text-muted-foreground">
                        {row.current_streak}d streak
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border bg-background/60 p-4 text-sm text-muted-foreground">
                  No leaderboard data yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

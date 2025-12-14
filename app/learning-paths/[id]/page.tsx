import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LearningPath } from "@/lib/ai/learning-path";

export const dynamic = "force-dynamic";

export default async function LearningPathDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    notFound();
  }

  const { id } = params;

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) notFound();

  const { data: row } = await supabase
    .from("learning_paths")
    .select("id,title,goal,curriculum")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!row) notFound();

  const curriculum = row.curriculum as unknown as LearningPath;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-24">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Learning path</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {row.title ?? row.goal}
            </h1>
            <p className="text-sm text-muted-foreground">{row.goal}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/learning-paths">All paths</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {curriculum.modules.map((m, idx) => (
            <Card key={`${m.title}-${idx}`} className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{m.summary}</p>

                <div className="space-y-3">
                  {m.lessons.map((l, lessonIdx) => (
                    <div
                      key={`${l.title}-${lessonIdx}`}
                      className="rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="text-sm font-medium">{l.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {l.summary}
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          Quiz
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                          {l.quiz.map((q, qIdx) => (
                            <li key={`${q.question}-${qIdx}`}>{q.question}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}

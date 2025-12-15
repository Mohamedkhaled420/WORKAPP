import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LearningPathCourse = {
  id: string;
  title: string;
  order: number;
  status: "not_started" | "started" | "completed";
  source_url: string;
  duration_weeks: number | null;
  difficulty_level: string | null;
  whyForYou?: string | null;
};

export default async function LearningPathDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) notFound();

  const { data: row } = await supabase
    .from("learning_paths")
    .select("id,path_name,description,courses")
    .eq("id", params.id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!row) notFound();

  const courses = (row.courses as unknown as LearningPathCourse[]) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Learning path</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {row.path_name ?? "Learning path"}
            </h1>
            {row.description ? (
              <p className="text-sm text-muted-foreground">{row.description}</p>
            ) : null}
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

        <section className="grid gap-4 md:grid-cols-2">
          {courses.length ? (
            courses
              .sort((a, b) => a.order - b.order)
              .map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {course.order}. {course.title}
                    </CardTitle>
                    <CardDescription>
                      {course.difficulty_level ?? "—"}
                      {course.duration_weeks
                        ? ` · ${course.duration_weeks}w`
                        : ""}
                      {course.status ? ` · ${course.status}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.whyForYou ? (
                      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                        {course.whyForYou}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <a href={course.source_url} target="_blank" rel="noreferrer">
                          Open on LinkedIn Learning
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/notes">Take notes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              This path has no courses yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

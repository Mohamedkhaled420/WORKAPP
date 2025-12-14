import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CourseRow = {
  id: string;
  title: string;
  source_url: string;
  duration_weeks: number | null;
  difficulty_level: string | null;
  description: string | null;
};

export default async function CoursesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Set Supabase env vars to load the courses library.
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </main>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: courses } = await supabase
    .from("courses_library")
    .select("id,title,source_url,duration_weeks,difficulty_level,description")
    .order("duration_weeks", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Library</p>
            <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
            <p className="text-sm text-muted-foreground">
              Curated LinkedIn Learning courses (direct links).
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {(courses as unknown as CourseRow[] | null)?.length ? (
            (courses as unknown as CourseRow[]).map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <CardDescription>
                    {course.difficulty_level ?? "—"}
                    {course.duration_weeks ? ` · ${course.duration_weeks}w` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.description ? (
                    <div className="text-sm text-muted-foreground">
                      {course.description}
                    </div>
                  ) : null}
                  <Button asChild>
                    <a href={course.source_url} target="_blank" rel="noreferrer">
                      Open on LinkedIn Learning
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No courses found</CardTitle>
                <CardDescription>
                  Seed the database using supabase/seed.sql.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

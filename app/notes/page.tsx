import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createNote } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Set Supabase env vars to enable notes.
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
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Sign in to create and edit notes.
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

  const { data: notes } = await supabase
    .from("notes")
    .select("id,title,updated_at")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-24">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Notes</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Intelligent note-taking
            </h1>
            <p className="text-sm text-muted-foreground">
              Highlight text to access the AI toolbar.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>New note</CardTitle>
            <CardDescription>Create a blank note and start writing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createNote}>
              <Button type="submit">Create note</Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Your notes</h2>
          <div className="grid gap-3">
            {notes?.length ? (
              notes.map((n) => (
                <Link
                  key={n.id}
                  href={`/notes/${n.id}`}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(n.updated_at).toLocaleString()}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                No notes yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Content } from "@tiptap/react";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { NoteEditor } from "@/components/editor/note-editor";

export const dynamic = "force-dynamic";

export default async function NotePage({
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

  const { data: note } = await supabase
    .from("notes")
    .select("id,title,content")
    .eq("id", params.id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!note) notFound();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/notes">Notes</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </header>

        <NoteEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={(note.content ?? "") as unknown as Content}
        />
      </main>
    </div>
  );
}

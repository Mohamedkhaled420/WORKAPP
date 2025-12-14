"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { awardPoints, maybeAwardNoteMaster, POINTS } from "@/lib/gamification";

export async function createNote() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/notes?error=supabase_env_missing");
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("notes")
    .insert({ user_id: auth.user.id, title: "Untitled", content: "" })
    .select("id")
    .single();

  if (error || !row) {
    redirect("/notes?error=note_create_failed");
  }

  await awardPoints(supabase, auth.user.id, POINTS.NOTE_CREATED);
  await maybeAwardNoteMaster(supabase, auth.user.id);

  redirect(`/notes/${row.id}`);
}

export async function updateNote(
  noteId: string,
  payload: { title: string; content: string },
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false as const, error: "Supabase env vars are not set." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("notes")
    .update({ title: payload.title, content: payload.content })
    .eq("id", noteId)
    .eq("user_id", auth.user.id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

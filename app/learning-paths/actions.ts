"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dominantTkiModesFromUserRow } from "@/lib/psychometrics";
import { generateLearningPath } from "@/lib/ai/learning-path";

export async function createLearningPath(goal: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false as const, error: "Supabase env vars are not set." };
  }

  const cleanGoal = goal.trim();
  if (!cleanGoal) {
    return { ok: false as const, error: "Goal is required." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select(
      "mbti_type,tki_competing,tki_collaborating,tki_compromising,tki_avoiding,tki_accommodating",
    )
    .eq("id", auth.user.id)
    .maybeSingle();

  const profile = {
    mbtiType: userRow?.mbti_type ?? undefined,
    tkiDominantModes: userRow ? dominantTkiModesFromUserRow(userRow) : null,
  };

  const curriculum = await generateLearningPath(cleanGoal, profile);

  const { data: inserted, error } = await supabase
    .from("learning_paths")
    .insert({
      user_id: auth.user.id,
      title: curriculum.title,
      goal: curriculum.goal,
      curriculum,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, id: inserted.id as string };
}

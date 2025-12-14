"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MbtiLetter, MbtiScores, MbtiType } from "@/lib/mbti";
import type { MbtiChoice } from "@/lib/assessments/mbti";
import type { TkiChoice, TkiMode, TkiScores } from "@/lib/tki";
import { dominantTkiModesFromScores } from "@/lib/psychometrics";

export interface SaveOnboardingPayload {
  mbti: {
    type: MbtiType;
    scores: MbtiScores;
    responses: Record<number, MbtiChoice>;
  };
  tki: {
    scores: TkiScores;
    dominantModes: TkiMode[];
    responses: Record<number, TkiChoice>;
  };
}

export async function saveOnboarding(payload: SaveOnboardingPayload) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false as const, error: "Supabase env vars are not set." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { ok: false as const, error: authError.message };
  }

  if (!auth.user) {
    return { ok: false as const, error: "You must be signed in to save." };
  }

  const dominantModes =
    payload.tki.dominantModes?.length > 0
      ? payload.tki.dominantModes
      : dominantTkiModesFromScores(payload.tki.scores);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      onboarding_step: 3,
      onboarding_completed: true,
      mbti_type: payload.mbti.type,
      mbti_dimensions: payload.mbti.scores as unknown as Record<MbtiLetter, number>,
      tki_competing: payload.tki.scores.competing,
      tki_collaborating: payload.tki.scores.collaborating,
      tki_compromising: payload.tki.scores.compromising,
      tki_avoiding: payload.tki.scores.avoiding,
      tki_accommodating: payload.tki.scores.accommodating,
    })
    .eq("id", auth.user.id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  const { error: assessmentError } = await supabase.from("assessments").insert([
    {
      user_id: auth.user.id,
      type: "mbti",
      responses: payload.mbti.responses,
      result: { type: payload.mbti.type, scores: payload.mbti.scores },
    },
    {
      user_id: auth.user.id,
      type: "tki",
      responses: payload.tki.responses,
      result: { scores: payload.tki.scores, dominantModes },
    },
  ]);

  if (assessmentError) {
    return { ok: false as const, error: assessmentError.message };
  }

  return { ok: true as const };
}

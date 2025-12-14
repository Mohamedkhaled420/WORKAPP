"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { awardBadgeByName, awardPoints, POINTS } from "@/lib/gamification";

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

export async function createLearningPath(focus: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false as const, error: "Supabase env vars are not set." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("mbti_type,tki_dominant_mode,role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const mbti = profile?.mbti_type ?? null;
  const tki = profile?.tki_dominant_mode ?? null;

  let query = supabase
    .from("courses_library")
    .select(
      "id,title,source_url,duration_weeks,difficulty_level,why_for_mbti,mbti_fit,tki_fit",
    );

  if (mbti) {
    query = query.contains("mbti_fit", [mbti]);
  }
  if (tki) {
    query = query.contains("tki_fit", [tki]);
  }

  const { data: courses } = await query.order("duration_weeks", { ascending: true }).limit(8);

  const selected = courses?.length
    ? courses
    : (
        await supabase
          .from("courses_library")
          .select("id,title,source_url,duration_weeks,difficulty_level,why_for_mbti")
          .order("duration_weeks", { ascending: true })
          .limit(8)
      ).data;

  const normalized: LearningPathCourse[] = (selected ?? []).map((course, idx) => {
    const whyForMbti =
      (course as { why_for_mbti?: Record<string, string> | null }).why_for_mbti ??
      null;

    return {
      id: course.id as string,
      title: course.title as string,
      order: idx + 1,
      status: "not_started",
      source_url: course.source_url as string,
      duration_weeks: (course.duration_weeks as number | null) ?? null,
      difficulty_level: (course.difficulty_level as string | null) ?? null,
      whyForYou: mbti ? whyForMbti?.[mbti] ?? null : null,
    };
  });

  const cleanFocus = focus.trim();
  const pathName = mbti
    ? `Your AI Journey (${mbti})${cleanFocus ? ` — ${cleanFocus}` : ""}`
    : `Your AI Journey${cleanFocus ? ` — ${cleanFocus}` : ""}`;

  const { data: inserted, error } = await supabase
    .from("learning_paths")
    .insert({
      user_id: auth.user.id,
      path_name: pathName,
      description: "Curated LinkedIn Learning courses matched to your profile.",
      courses: normalized,
      status: "active",
      progress_percentage: 0,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false as const, error: error?.message ?? "Failed to create." };
  }

  await awardPoints(supabase, auth.user.id, POINTS.LEARNING_PATH_CREATED);

  const { count } = await supabase
    .from("learning_paths")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  if ((count ?? 0) === 1) {
    await awardBadgeByName(supabase, auth.user.id, "Course Starter");
  }

  return { ok: true as const, id: inserted.id as string };
}

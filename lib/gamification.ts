import type { SupabaseClient } from "@supabase/supabase-js";

export const POINTS = {
  MBTI_COMPLETE: 50,
  TKI_COMPLETE: 50,
  NOTE_CREATED: 5,
  AI_TRANSFORM: 10,
  DAILY_LOGIN_AFTER_DAY_3: 5,
  STREAK_7_BONUS: 50,
  LEARNING_PATH_CREATED: 10,
} as const;

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function awardPoints(
  supabase: SupabaseClient,
  userId: string,
  delta: number,
): Promise<void> {
  const { data: user } = await supabase
    .from("users")
    .select("total_points")
    .eq("id", userId)
    .maybeSingle();

  const current = user?.total_points ?? 0;
  const next = current + delta;

  await supabase.from("users").update({ total_points: next }).eq("id", userId);

  await maybeAwardBadgeOnPoints(supabase, userId, next);
}

export async function updateStreak(supabase: SupabaseClient, userId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("current_streak,longest_streak,last_login_date,total_points")
    .eq("id", userId)
    .maybeSingle();

  if (!user) return;

  const today = new Date();
  const todayStr = toUtcDateString(today);
  const last = user.last_login_date as string | null;

  if (last === todayStr) {
    return;
  }

  let currentStreak = user.current_streak ?? 0;
  let longestStreak = user.longest_streak ?? 0;
  let pointsToAdd = 0;

  if (!last) {
    currentStreak = 1;
  } else {
    const lastDate = new Date(`${last}T00:00:00.000Z`);
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  if (currentStreak >= 3) {
    pointsToAdd += POINTS.DAILY_LOGIN_AFTER_DAY_3;
  }
  if (currentStreak === 7) {
    pointsToAdd += POINTS.STREAK_7_BONUS;
  }

  const nextPoints = (user.total_points ?? 0) + pointsToAdd;

  await supabase
    .from("users")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_login_date: todayStr,
      total_points: nextPoints,
    })
    .eq("id", userId);

  if (currentStreak >= 7) {
    await awardBadgeByName(supabase, userId, "Consistent Learner");
  }

  await maybeAwardBadgeOnPoints(supabase, userId, nextPoints);
}

export async function awardBadgeByName(
  supabase: SupabaseClient,
  userId: string,
  badgeName: string,
) {
  const { data: badge } = await supabase
    .from("badges")
    .select("id,points_reward")
    .eq("name", badgeName)
    .maybeSingle();

  if (!badge) return;

  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badge.id,
  });

  if (error) {
    return;
  }

  if (badge.points_reward && badge.points_reward > 0) {
    await awardPoints(supabase, userId, badge.points_reward);
  }
}

export async function maybeAwardNoteMaster(supabase: SupabaseClient, userId: string) {
  const { count } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) >= 20) {
    await awardBadgeByName(supabase, userId, "Note Master");
  }
}

async function maybeAwardBadgeOnPoints(
  supabase: SupabaseClient,
  userId: string,
  totalPoints: number,
) {
  if (totalPoints >= 500) {
    await awardBadgeByName(supabase, userId, "Knowledge Seeker");
  }
  if (totalPoints >= 1000) {
    await awardBadgeByName(supabase, userId, "Legendary");
  }
}

import type { TkiMode } from "@/lib/tki";

export interface UserPsychometrics {
  mbtiType?: string | null;
  tkiDominantModes?: TkiMode[] | null;
}

export function buildToneInstruction(profile: UserPsychometrics): string {
  const mbti = profile.mbtiType?.toUpperCase();
  const dominant = profile.tkiDominantModes?.length
    ? profile.tkiDominantModes
    : null;

  const parts: string[] = [
    "Write in a minimalist, professional tone.",
    "Use short paragraphs and crisp bullets.",
    "Avoid hype, emojis, or bright language.",
  ];

  if (mbti) {
    parts.push(`Tone-match the user's MBTI type: ${mbti}.`);

    if (mbti.includes("NT")) {
      parts.push("Prioritize clarity, structure, and directness.");
    }

    if (mbti.includes("NF")) {
      parts.push("Be encouraging and values-aware while staying concise.");
    }

    if (mbti.startsWith("I")) {
      parts.push("Prefer calm, reflective phrasing over energetic language.");
    }
  }

  if (dominant?.length) {
    parts.push(`The user's dominant conflict modes: ${dominant.join(", ")}.`);

    if (dominant.includes("collaborating")) {
      parts.push("Emphasize shared goals and integration.");
    }
    if (dominant.includes("competing")) {
      parts.push("Be decisive and outcome-focused.");
    }
    if (dominant.includes("avoiding")) {
      parts.push("De-escalate and keep suggestions low-friction.");
    }
    if (dominant.includes("accommodating")) {
      parts.push("Be tactful and relationship-aware.");
    }
    if (dominant.includes("compromising")) {
      parts.push("Prefer pragmatic middle-ground solutions.");
    }
  }

  return parts.join(" ");
}

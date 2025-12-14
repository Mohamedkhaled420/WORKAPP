import type { TkiMode, TkiScores } from "@/lib/tki";

export interface StoredTkiScoresRow {
  tki_scores: unknown | null;
  tki_dominant_mode?: string | null;
}

const MODES: TkiMode[] = [
  "competing",
  "collaborating",
  "compromising",
  "avoiding",
  "accommodating",
];

export function dominantTkiModesFromScores(scores: TkiScores): TkiMode[] {
  const sorted = [...MODES].sort((a, b) => scores[b] - scores[a]);
  const top = sorted[0];
  return sorted.filter((m) => scores[m] === scores[top]);
}

export function parseTkiScores(input: unknown): TkiScores | null {
  if (!input || typeof input !== "object") return null;

  const obj = input as Record<string, unknown>;
  const scores: Record<TkiMode, number> = {
    competing: Number(obj.competing ?? 0),
    collaborating: Number(obj.collaborating ?? 0),
    compromising: Number(obj.compromising ?? 0),
    avoiding: Number(obj.avoiding ?? 0),
    accommodating: Number(obj.accommodating ?? 0),
  };

  if (MODES.some((m) => !Number.isFinite(scores[m]))) return null;

  const sum = MODES.reduce((acc, mode) => acc + scores[mode], 0);
  if (sum <= 0) return null;

  return scores;
}

export function dominantTkiModesFromUserRow(
  row: StoredTkiScoresRow,
): TkiMode[] | null {
  const parsed = parseTkiScores(row.tki_scores);
  if (!parsed) return null;
  return dominantTkiModesFromScores(parsed);
}

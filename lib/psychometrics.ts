import type { TkiMode, TkiScores } from "@/lib/tki";

export interface StoredTkiScores {
  tki_competing: number | null;
  tki_collaborating: number | null;
  tki_compromising: number | null;
  tki_avoiding: number | null;
  tki_accommodating: number | null;
}

export function dominantTkiModesFromScores(scores: TkiScores): TkiMode[] {
  const modes = Object.keys(scores) as TkiMode[];
  const sorted = [...modes].sort((a, b) => scores[b] - scores[a]);
  const top = sorted[0];
  return sorted.filter((m) => scores[m] === scores[top]);
}

export function dominantTkiModesFromUserRow(row: StoredTkiScores): TkiMode[] | null {
  const scores: TkiScores = {
    competing: row.tki_competing ?? 0,
    collaborating: row.tki_collaborating ?? 0,
    compromising: row.tki_compromising ?? 0,
    avoiding: row.tki_avoiding ?? 0,
    accommodating: row.tki_accommodating ?? 0,
  };

  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  if (sum === 0) return null;

  return dominantTkiModesFromScores(scores);
}

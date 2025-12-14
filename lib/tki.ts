export type TkiMode =
  | "competing"
  | "collaborating"
  | "compromising"
  | "avoiding"
  | "accommodating";

export type TkiChoice = "A" | "B";

export type TkiAnswerKey = Record<number, { A: TkiMode; B: TkiMode }>;

export type TkiResponses = Record<number, TkiChoice>;

export type TkiScores = Record<TkiMode, number>;

export interface TkiScoreResult {
  scores: TkiScores;
  dominantModes: TkiMode[];
  totalAnswered: number;
}

const MODES: TkiMode[] = [
  "competing",
  "collaborating",
  "compromising",
  "avoiding",
  "accommodating",
];

// This mapping is for a simplified, internal TKI-style forced-choice assessment.
// Each question presents two statements (A and B); the chosen letter earns one point
// for the corresponding conflict mode.
export const DEFAULT_TKI_KEY: TkiAnswerKey = {
  1: { A: "competing", B: "accommodating" },
  2: { A: "collaborating", B: "avoiding" },
  3: { A: "compromising", B: "competing" },
  4: { A: "accommodating", B: "collaborating" },
  5: { A: "avoiding", B: "compromising" },
  6: { A: "competing", B: "collaborating" },
  7: { A: "accommodating", B: "avoiding" },
  8: { A: "compromising", B: "accommodating" },
  9: { A: "collaborating", B: "compromising" },
  10: { A: "avoiding", B: "competing" },
  11: { A: "competing", B: "compromising" },
  12: { A: "collaborating", B: "accommodating" },
  13: { A: "avoiding", B: "collaborating" },
  14: { A: "compromising", B: "avoiding" },
  15: { A: "accommodating", B: "competing" },
  16: { A: "collaborating", B: "competing" },
  17: { A: "avoiding", B: "accommodating" },
  18: { A: "compromising", B: "collaborating" },
  19: { A: "competing", B: "avoiding" },
  20: { A: "accommodating", B: "compromising" },
  21: { A: "collaborating", B: "avoiding" },
  22: { A: "compromising", B: "competing" },
  23: { A: "avoiding", B: "competing" },
  24: { A: "accommodating", B: "collaborating" },
  25: { A: "competing", B: "accommodating" },
  26: { A: "collaborating", B: "compromising" },
  27: { A: "avoiding", B: "compromising" },
  28: { A: "accommodating", B: "avoiding" },
  29: { A: "compromising", B: "accommodating" },
  30: { A: "collaborating", B: "competing" },
};

export function scoreTki(
  responses: TkiResponses | TkiChoice[],
  answerKey: TkiAnswerKey = DEFAULT_TKI_KEY,
): TkiScoreResult {
  const scores = MODES.reduce(
    (acc, mode) => ({ ...acc, [mode]: 0 }),
    {} as TkiScores,
  );

  const responseRecord: TkiResponses = Array.isArray(responses)
    ? responses.reduce((acc, choice, index) => {
        acc[index + 1] = choice;
        return acc;
      }, {} as TkiResponses)
    : responses;

  let totalAnswered = 0;

  for (const [rawItem, rawChoice] of Object.entries(responseRecord)) {
    const item = Number(rawItem);
    const choice = rawChoice;

    if (!Number.isFinite(item)) continue;
    if (choice !== "A" && choice !== "B") continue;

    const key = answerKey[item];
    if (!key) continue;

    scores[key[choice]] += 1;
    totalAnswered += 1;
  }

  const sortedModes = [...MODES].sort((a, b) => scores[b] - scores[a]);

  const dominantModes = sortedModes.filter(
    (mode) => scores[mode] === scores[sortedModes[0]],
  );

  return {
    scores,
    dominantModes,
    totalAnswered,
  };
}

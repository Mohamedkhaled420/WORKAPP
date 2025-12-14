import type { MbtiChoice, MbtiQuestion } from "@/lib/assessments/mbti";

export type MbtiDimension = "EI" | "SN" | "TF" | "JP";

export type MbtiLetter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export type MbtiType = `${"E" | "I"}${"S" | "N"}${"T" | "F"}${"J" | "P"}`;

export type MbtiResponses = Record<number, MbtiChoice>;

export type MbtiScores = Record<MbtiLetter, number>;

export interface MbtiResult {
  type: MbtiType;
  scores: MbtiScores;
  totalAnswered: number;
}

const LETTERS: MbtiLetter[] = ["E", "I", "S", "N", "T", "F", "J", "P"];

function initScores(): MbtiScores {
  return LETTERS.reduce((acc, letter) => {
    acc[letter] = 0;
    return acc;
  }, {} as MbtiScores);
}

export function scoreMbti(
  responses: MbtiResponses,
  questions: MbtiQuestion[],
): MbtiResult {
  const scores = initScores();
  let totalAnswered = 0;

  const questionById = new Map<number, MbtiQuestion>(
    questions.map((q) => [q.id, q]),
  );

  for (const [rawId, choice] of Object.entries(responses)) {
    const id = Number(rawId);
    if (!Number.isFinite(id)) continue;

    const question = questionById.get(id);
    if (!question) continue;

    if (choice !== "A" && choice !== "B") continue;

    const letter = choice === "A" ? question.aLetter : question.bLetter;
    scores[letter] += 1;
    totalAnswered += 1;
  }

  const pick = (a: MbtiLetter, b: MbtiLetter): MbtiLetter =>
    scores[a] >= scores[b] ? a : b;

  const type = `${pick("E", "I")}${pick("S", "N")}${pick("T", "F")}${pick("J", "P")}` as MbtiType;

  return {
    type,
    scores,
    totalAnswered,
  };
}

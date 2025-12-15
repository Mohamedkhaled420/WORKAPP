import type { MbtiDimension, MbtiLetter } from "@/lib/mbti";

export type MbtiChoice = "A" | "B";

export interface MbtiQuestion {
  id: number;
  dimension: MbtiDimension;
  a: string;
  b: string;
  aLetter: MbtiLetter;
  bLetter: MbtiLetter;
}

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  {
    id: 1,
    dimension: "EI",
    a: "I gain energy by talking ideas out with other people.",
    b: "I gain energy by thinking things through privately.",
    aLetter: "E",
    bLetter: "I",
  },
  {
    id: 2,
    dimension: "EI",
    a: "I prefer to think out loud and iterate in conversation.",
    b: "I prefer to reflect first, then share a considered view.",
    aLetter: "E",
    bLetter: "I",
  },
  {
    id: 3,
    dimension: "EI",
    a: "Meeting new people feels energizing.",
    b: "Meeting new people can be draining, even if I enjoy it.",
    aLetter: "E",
    bLetter: "I",
  },
  {
    id: 4,
    dimension: "SN",
    a: "I trust what’s concrete, proven, and immediately useful.",
    b: "I trust patterns, possibilities, and big-picture direction.",
    aLetter: "S",
    bLetter: "N",
  },
  {
    id: 5,
    dimension: "SN",
    a: "I prefer step-by-step instructions.",
    b: "I prefer to understand the system, then improvise.",
    aLetter: "S",
    bLetter: "N",
  },
  {
    id: 6,
    dimension: "SN",
    a: "I focus on details and execution.",
    b: "I focus on concepts and strategy.",
    aLetter: "S",
    bLetter: "N",
  },
  {
    id: 7,
    dimension: "TF",
    a: "In decisions, I prioritize logic and objective criteria.",
    b: "In decisions, I prioritize values and people impact.",
    aLetter: "T",
    bLetter: "F",
  },
  {
    id: 8,
    dimension: "TF",
    a: "I like direct feedback, even if it’s blunt.",
    b: "I like feedback delivered with care and context.",
    aLetter: "T",
    bLetter: "F",
  },
  {
    id: 9,
    dimension: "TF",
    a: "I’m more comfortable debating ideas.",
    b: "I’m more comfortable building harmony.",
    aLetter: "T",
    bLetter: "F",
  },
  {
    id: 10,
    dimension: "JP",
    a: "I prefer clear plans, timelines, and closure.",
    b: "I prefer flexibility, options, and discovery.",
    aLetter: "J",
    bLetter: "P",
  },
  {
    id: 11,
    dimension: "JP",
    a: "I like to decide early.",
    b: "I like to keep things open until I have more info.",
    aLetter: "J",
    bLetter: "P",
  },
  {
    id: 12,
    dimension: "JP",
    a: "I feel best when things are organized.",
    b: "I feel best when things are adaptable.",
    aLetter: "J",
    bLetter: "P",
  },
];

export interface TkiQuestion {
  id: number;
  a: string;
  b: string;
}

// 15 paired statements (TKI-style forced choice).
export const TKI_QUESTIONS: TkiQuestion[] = [
  {
    id: 1,
    a: "I push for my preferred solution.",
    b: "I try to maintain goodwill even if I give up ground.",
  },
  {
    id: 2,
    a: "I look for a win-win option.",
    b: "I pause or step back to avoid escalation.",
  },
  {
    id: 3,
    a: "I avoid the disagreement.",
    b: "I take a strong stance on what I want.",
  },
  {
    id: 4,
    a: "I propose a quick compromise.",
    b: "I collaborate to solve the root issue.",
  },
  {
    id: 5,
    a: "I accommodate to preserve the relationship.",
    b: "I suggest we meet in the middle.",
  },
  {
    id: 6,
    a: "I insist on my position.",
    b: "I work with the other person to integrate both needs.",
  },
  {
    id: 7,
    a: "I withdraw until emotions cool down.",
    b: "I adapt to their preference.",
  },
  {
    id: 8,
    a: "I offer a trade-off.",
    b: "I argue for my view.",
  },
  {
    id: 9,
    a: "I search for the best shared outcome.",
    b: "I settle for an acceptable middle ground.",
  },
  {
    id: 10,
    a: "I yield to keep peace.",
    b: "I put it off and return later.",
  },
  {
    id: 11,
    a: "I take a firm stance when it matters.",
    b: "I suggest splitting the difference.",
  },
  {
    id: 12,
    a: "I collaborate to address both priorities.",
    b: "I adjust my needs to help the other person.",
  },
  {
    id: 13,
    a: "I sidestep it.",
    b: "I invite a deeper discussion to resolve it.",
  },
  {
    id: 14,
    a: "I compromise to close the gap.",
    b: "I withdraw from the disagreement.",
  },
  {
    id: 15,
    a: "I accommodate theirs.",
    b: "I fight for what I want.",
  },
];

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { buildToneInstruction, type UserPsychometrics } from "@/lib/ai/profile";

export const LearningPathSchema = z.object({
  title: z.string().min(1),
  goal: z.string().min(1),
  modules: z
    .array(
      z.object({
        title: z.string().min(1),
        summary: z.string().min(1),
        lessons: z
          .array(
            z.object({
              title: z.string().min(1),
              summary: z.string().min(1),
              quiz: z
                .array(
                  z.object({
                    question: z.string().min(1),
                    choices: z.array(z.string().min(1)).min(2).max(5),
                    answerIndex: z.number().int().min(0).max(4),
                    explanation: z.string().min(1),
                  }),
                )
                .min(2)
                .max(5),
            }),
          )
          .min(3)
          .max(6),
      }),
    )
    .min(3)
    .max(8),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

function fallbackLearningPath(goal: string): LearningPath {
  return {
    title: `Learning Path: ${goal}`,
    goal,
    modules: [
      {
        title: "Foundations",
        summary: "Build core concepts and vocabulary.",
        lessons: [
          {
            title: "Key concepts",
            summary: "Understand the basic building blocks.",
            quiz: [
              {
                question: "What is the primary objective of this learning path?",
                choices: ["Memorization", "Structured skill building", "Speed only"],
                answerIndex: 1,
                explanation: "The goal is structured skill building that compounds.",
              },
              {
                question: "What should you do when a concept feels unclear?",
                choices: [
                  "Skip it",
                  "Revisit with examples and practice",
                  "Assume it will resolve later",
                ],
                answerIndex: 1,
                explanation: "Examples + practice create durable understanding.",
              },
            ],
          },
          {
            title: "Practical setup",
            summary: "Set up tools and a repeatable workflow.",
            quiz: [
              {
                question: "A good workflow is…",
                choices: ["Random", "Repeatable", "Only for experts"],
                answerIndex: 1,
                explanation: "Repeatability reduces friction and increases output.",
              },
              {
                question: "Best way to reduce learning friction?",
                choices: [
                  "Clear environment + small steps",
                  "All-nighters",
                  "Avoid notes",
                ],
                answerIndex: 0,
                explanation: "Small steps plus a stable environment builds momentum.",
              },
            ],
          },
          {
            title: "First project",
            summary: "Apply fundamentals immediately.",
            quiz: [
              {
                question: "Why build a small project early?",
                choices: [
                  "To prove knowledge",
                  "To create feedback loops",
                  "Because it looks impressive",
                ],
                answerIndex: 1,
                explanation: "Projects create rapid feedback loops.",
              },
              {
                question: "A good first project should be…",
                choices: ["Huge", "Clear and scoped", "Vague"],
                answerIndex: 1,
                explanation: "Scope clarity helps you finish and learn.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediate Skills",
        summary: "Practice patterns and build confidence.",
        lessons: [
          {
            title: "Common patterns",
            summary: "Learn frequently-used patterns for this goal.",
            quiz: [
              {
                question: "Patterns are useful because…",
                choices: [
                  "They reduce cognitive load",
                  "They remove creativity",
                  "They replace understanding",
                ],
                answerIndex: 0,
                explanation: "Good patterns reduce cognitive load while preserving understanding.",
              },
              {
                question: "Best way to learn patterns?",
                choices: ["Copy without thinking", "Practice deliberately", "Avoid them"],
                answerIndex: 1,
                explanation: "Deliberate practice builds intuition.",
              },
            ],
          },
          {
            title: "Troubleshooting",
            summary: "Develop a calm debugging process.",
            quiz: [
              {
                question: "First step in troubleshooting?",
                choices: ["Guess", "Reproduce consistently", "Blame tools"],
                answerIndex: 1,
                explanation: "Reproducibility makes problems solvable.",
              },
              {
                question: "When stuck, you should…",
                choices: [
                  "Stop and write what you know",
                  "Keep random changes",
                  "Quit immediately",
                ],
                answerIndex: 0,
                explanation: "Writing clarifies thinking and narrows causes.",
              },
            ],
          },
          {
            title: "Second project",
            summary: "Increase complexity with constraints.",
            quiz: [
              {
                question: "Constraints help because…",
                choices: [
                  "They force trade-offs",
                  "They prevent learning",
                  "They waste time",
                ],
                answerIndex: 0,
                explanation: "Trade-offs mirror real work.",
              },
              {
                question: "A good next constraint is…",
                choices: ["No plan", "Time-boxed scope", "Infinite features"],
                answerIndex: 1,
                explanation: "Time-boxing keeps learning focused.",
              },
            ],
          },
        ],
      },
      {
        title: "Capstone",
        summary: "Ship something meaningful and reflect.",
        lessons: [
          {
            title: "Define success",
            summary: "Pick clear outcomes and evaluation criteria.",
            quiz: [
              {
                question: "Success criteria should be…",
                choices: ["Vague", "Measurable", "Secret"],
                answerIndex: 1,
                explanation: "Measurable criteria guides effort and review.",
              },
              {
                question: "Why define criteria early?",
                choices: ["To avoid work", "To align decisions", "To impress others"],
                answerIndex: 1,
                explanation: "Criteria align decisions throughout the project.",
              },
            ],
          },
          {
            title: "Ship + iterate",
            summary: "Deliver a first version and improve with feedback.",
            quiz: [
              {
                question: "Iteration requires…",
                choices: ["Feedback", "Perfection", "Silence"],
                answerIndex: 0,
                explanation: "Feedback makes iteration directionally correct.",
              },
              {
                question: "Best mindset for shipping?",
                choices: ["All-or-nothing", "Small increments", "Never release"],
                answerIndex: 1,
                explanation: "Small increments reduce risk and keep momentum.",
              },
            ],
          },
          {
            title: "Retrospective",
            summary: "Capture what worked and what to change next time.",
            quiz: [
              {
                question: "A retrospective is used to…",
                choices: ["Assign blame", "Improve systems", "Delete notes"],
                answerIndex: 1,
                explanation: "The goal is system improvement.",
              },
              {
                question: "What should you write down?",
                choices: [
                  "Only wins",
                  "Wins + mistakes + next actions",
                  "Nothing",
                ],
                answerIndex: 1,
                explanation: "Balanced reflection creates actionable insight.",
              },
            ],
          },
        ],
      },
    ],
  };
}

export async function generateLearningPath(
  goal: string,
  profile: UserPsychometrics,
): Promise<LearningPath> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackLearningPath(goal);
  }

  const system = [
    "You are designing a structured curriculum for a professional development app.",
    "Output must be valid JSON that matches the provided schema.",
    "Keep titles minimalist and in plain language.",
    buildToneInstruction(profile),
  ].join(" ");

  const prompt = [
    `Goal: ${goal}`,
    "Create a curriculum as modules -> lessons -> quizzes.",
    "Each lesson should have a short summary and a small quiz.",
  ].join("\n");

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: LearningPathSchema,
    system,
    prompt,
  });

  return object;
}

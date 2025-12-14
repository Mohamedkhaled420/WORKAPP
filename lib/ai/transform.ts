import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { buildToneInstruction, type UserPsychometrics } from "@/lib/ai/profile";

export type AiTransformAction =
  | "simplify"
  | "fix_grammar"
  | "summarize"
  | "action_items";

function fallbackTransform(action: AiTransformAction, text: string): string {
  const trimmed = text.trim();

  switch (action) {
    case "summarize": {
      const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
      return sentences.slice(0, 2).join(" ");
    }
    case "action_items": {
      const sentences = trimmed
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      return sentences.map((s) => `- ${s.replace(/[.!?]+$/, "")}`).join("\n");
    }
    case "fix_grammar":
    case "simplify":
    default:
      return trimmed;
  }
}

export async function transformText(
  action: AiTransformAction,
  text: string,
  profile: UserPsychometrics,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackTransform(action, text);
  }

  const system = [
    "You are an editing assistant embedded in a minimalist professional notes app.",
    "Return only the transformed text. No preamble.",
    buildToneInstruction(profile),
  ].join(" ");

  const promptByAction: Record<AiTransformAction, string> = {
    simplify: `Simplify the text while preserving meaning.\n\nTEXT:\n${text}`,
    fix_grammar: `Fix grammar and clarity. Keep the original tone.\n\nTEXT:\n${text}`,
    summarize: `Summarize the text in 3-6 bullet points.\n\nTEXT:\n${text}`,
    action_items: `Convert the text into a short checklist of action items.\n\nTEXT:\n${text}`,
  };

  const { text: out } = await generateText({
    model: openai("gpt-4o-mini"),
    system,
    prompt: promptByAction[action],
  });

  return out.trim();
}

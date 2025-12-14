import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { transformText, type AiTransformAction } from "@/lib/ai/transform";
import { dominantTkiModesFromUserRow } from "@/lib/psychometrics";
import type { TkiMode } from "@/lib/tki";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { action?: AiTransformAction; text?: string }
    | null;

  const action = body?.action;
  const text = body?.text;

  if (!action || !text) {
    return NextResponse.json(
      { error: "Missing required fields: action, text" },
      { status: 400 },
    );
  }

  let profile: {
    mbtiType?: string;
    tkiDominantModes: TkiMode[] | null;
  } = { mbtiType: undefined, tkiDominantModes: null };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: auth } = await supabase.auth.getUser();

      if (auth.user) {
        const { data: userRow } = await supabase
          .from("users")
          .select(
            "mbti_type,tki_competing,tki_collaborating,tki_compromising,tki_avoiding,tki_accommodating",
          )
          .eq("id", auth.user.id)
          .maybeSingle();

        profile = {
          mbtiType: userRow?.mbti_type ?? undefined,
          tkiDominantModes: userRow
            ? dominantTkiModesFromUserRow(userRow)
            : null,
        };
      }
    } catch {
      // best-effort: ignore profile lookup
    }
  }

  const out = await transformText(action, text, profile);
  return NextResponse.json({ result: out });
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Code2,
  GraduationCap,
  Lightbulb,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MBTI_QUESTIONS, type MbtiChoice } from "@/lib/assessments/mbti";
import { TKI_QUESTIONS } from "@/lib/assessments/tki";
import { scoreMbti } from "@/lib/mbti";
import { scoreTki, type TkiChoice } from "@/lib/tki";
import { AnimatedText } from "@/components/animated-text";
import { LiquidBlobBackground } from "@/components/liquid-blob-background";
import { LiquidGlassCard } from "@/components/liquid-glass-card";

import { saveOnboarding } from "./actions";

type Step = "welcome" | "role" | "mbti" | "tki" | "results" | "signup" | "done";

const STEP_ANIMATION = {
  initial: { opacity: 0, y: 16, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(12px)" },
} as const;

const ROLES = [
  { key: "Manager", label: "Manager", icon: Briefcase },
  { key: "Developer", label: "Developer", icon: Code2 },
  { key: "Student", label: "Student", icon: GraduationCap },
  { key: "Consultant", label: "Consultant", icon: Lightbulb },
  { key: "HR", label: "HR Professional", icon: Users },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");

  const [role, setRole] = useState<string>("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [mbtiIndex, setMbtiIndex] = useState(0);
  const [mbtiResponses, setMbtiResponses] = useState<Record<number, MbtiChoice>>(
    {},
  );

  const [tkiIndex, setTkiIndex] = useState(0);
  const [tkiResponses, setTkiResponses] = useState<Record<number, TkiChoice>>({});

  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error) {
          setAuthError(error.message);
          return;
        }

        setUserEmail(data.user?.email ?? null);
      } catch (err) {
        if (cancelled) return;
        setAuthError(err instanceof Error ? err.message : "Auth unavailable.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const mbtiResult = useMemo(() => scoreMbti(mbtiResponses, MBTI_QUESTIONS), [
    mbtiResponses,
  ]);

  const tkiResult = useMemo(() => scoreTki(tkiResponses), [tkiResponses]);

  const mbtiComplete = useMemo(
    () => Object.keys(mbtiResponses).length === MBTI_QUESTIONS.length,
    [mbtiResponses],
  );

  const tkiComplete = useMemo(
    () => Object.keys(tkiResponses).length === TKI_QUESTIONS.length,
    [tkiResponses],
  );

  const progress = useMemo(() => {
    const indexByStep: Record<Step, number> = {
      welcome: 0,
      role: 1,
      mbti: 2,
      tki: 3,
      results: 4,
      signup: 5,
      done: 6,
    };

    return (indexByStep[step] / 6) * 100;
  }, [step]);

  if (step === "done") {
    return (
      <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Onboarding</div>
          <h2 className="text-2xl font-semibold tracking-tight">Complete</h2>
          <p className="text-sm text-muted-foreground">
            Your profile is saved. Next: explore the dashboard.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/learning-paths">Learning paths</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/notes">Notes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-background/70 p-1">
      <div className="relative overflow-hidden rounded-[1.35rem] bg-background">
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.35rem]">
          <LiquidBlobBackground />

          <div className="relative flex min-h-[520px] items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl">
              {authError ? (
                <div className="mb-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                  Auth: {authError}
                </div>
              ) : null}

              <LiquidGlassCard className="rounded-3xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    {userEmail ? `Signed in as ${userEmail}` : "Guest session"}
                  </div>
                  <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    {step === "welcome" ? (
                      <motion.div
                        key="welcome"
                        {...STEP_ANIMATION}
                        transition={{ duration: 0.35 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Step 1
                          </div>
                          <h2 className="text-3xl font-semibold tracking-tight">
                            <AnimatedText text="Let’s get to know you" />
                          </h2>
                          <p className="text-sm leading-6 text-muted-foreground">
                            A short onboarding so the app can personalize learning, news, and AI.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => setStep("role")}
                            className="transition-transform active:scale-[0.98]"
                          >
                            Next
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href="/">Back</Link>
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}

                    {step === "role" ? (
                      <motion.div
                        key="role"
                        {...STEP_ANIMATION}
                        transition={{ duration: 0.35 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Step 2
                          </div>
                          <h2 className="text-2xl font-semibold tracking-tight">
                            <AnimatedText text="What best describes you?" />
                          </h2>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {ROLES.map((r) => {
                            const Icon = r.icon;
                            const selected = role === r.key;

                            return (
                              <Button
                                key={r.key}
                                type="button"
                                variant={selected ? "default" : "outline"}
                                className="h-auto justify-start gap-3 whitespace-normal py-4"
                                onClick={() => setRole(r.key)}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{r.label}</span>
                              </Button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" onClick={() => setStep("welcome")}>
                            Back
                          </Button>
                          <Button disabled={!role} onClick={() => setStep("mbti")}>
                            Next
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}

                    {step === "mbti" ? (
                      <motion.div
                        key="mbti"
                        {...STEP_ANIMATION}
                        transition={{ duration: 0.35 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Step 3
                          </div>
                          <h2 className="text-2xl font-semibold tracking-tight">
                            MBTI (12 questions)
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Question {mbtiIndex + 1} / {MBTI_QUESTIONS.length}
                          </p>
                        </div>

                        {(() => {
                          const q = MBTI_QUESTIONS[mbtiIndex];
                          return (
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant={mbtiResponses[q.id] === "A" ? "default" : "outline"}
                                className="h-auto w-full justify-start whitespace-normal py-4"
                                onClick={() => {
                                  setMbtiResponses((prev) => ({ ...prev, [q.id]: "A" }));
                                  if (mbtiIndex < MBTI_QUESTIONS.length - 1) {
                                    setMbtiIndex((i) => i + 1);
                                  }
                                }}
                              >
                                {q.a}
                              </Button>
                              <Button
                                type="button"
                                variant={mbtiResponses[q.id] === "B" ? "default" : "outline"}
                                className="h-auto w-full justify-start whitespace-normal py-4"
                                onClick={() => {
                                  setMbtiResponses((prev) => ({ ...prev, [q.id]: "B" }));
                                  if (mbtiIndex < MBTI_QUESTIONS.length - 1) {
                                    setMbtiIndex((i) => i + 1);
                                  }
                                }}
                              >
                                {q.b}
                              </Button>
                            </div>
                          );
                        })()}

                        <div className="rounded-xl border bg-background/60 p-4 text-sm">
                          Current type: <span className="font-medium">{mbtiResult.type}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (mbtiIndex === 0) {
                                setStep("role");
                                return;
                              }
                              setMbtiIndex((i) => Math.max(0, i - 1));
                            }}
                          >
                            Back
                          </Button>
                          <Button
                            disabled={!mbtiComplete}
                            onClick={() => setStep("tki")}
                          >
                            Next
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}

                    {step === "tki" ? (
                      <motion.div
                        key="tki"
                        {...STEP_ANIMATION}
                        transition={{ duration: 0.35 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Step 4
                          </div>
                          <h2 className="text-2xl font-semibold tracking-tight">TKI (15 pairs)</h2>
                          <p className="text-sm text-muted-foreground">
                            Pair {tkiIndex + 1} / {TKI_QUESTIONS.length}
                          </p>
                        </div>

                        {(() => {
                          const q = TKI_QUESTIONS[tkiIndex];
                          return (
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant={tkiResponses[q.id] === "A" ? "default" : "outline"}
                                className="h-auto w-full justify-start whitespace-normal py-4"
                                onClick={() => {
                                  setTkiResponses((prev) => ({ ...prev, [q.id]: "A" }));
                                  if (tkiIndex < TKI_QUESTIONS.length - 1) {
                                    setTkiIndex((i) => i + 1);
                                  }
                                }}
                              >
                                {q.a}
                              </Button>
                              <Button
                                type="button"
                                variant={tkiResponses[q.id] === "B" ? "default" : "outline"}
                                className="h-auto w-full justify-start whitespace-normal py-4"
                                onClick={() => {
                                  setTkiResponses((prev) => ({ ...prev, [q.id]: "B" }));
                                  if (tkiIndex < TKI_QUESTIONS.length - 1) {
                                    setTkiIndex((i) => i + 1);
                                  }
                                }}
                              >
                                {q.b}
                              </Button>
                            </div>
                          );
                        })()}

                        <div className="rounded-xl border bg-background/60 p-4 text-sm">
                          Dominant mode: <span className="font-medium">{tkiResult.dominantModes[0] ?? "—"}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (tkiIndex === 0) {
                                setStep("mbti");
                                return;
                              }
                              setTkiIndex((i) => Math.max(0, i - 1));
                            }}
                          >
                            Back
                          </Button>
                          <Button disabled={!tkiComplete} onClick={() => setStep("results")}>
                            Next
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}

                    {step === "results" ? (
                      <motion.div
                        key="results"
                        {...STEP_ANIMATION}
                        transition={{ duration: 0.35 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Step 5
                          </div>
                          <h2 className="text-2xl font-semibold tracking-tight">
                            <AnimatedText text="Your profile" />
                          </h2>
                        </div>

                        <div className="grid gap-3 rounded-2xl border bg-background/60 p-5">
                          <div className="text-xs font-medium text-muted-foreground">MBTI</div>
                          <div className="text-4xl font-semibold tracking-tight text-primary">
                            {mbtiResult.type}
                          </div>

                          <div className="pt-3 text-xs font-medium text-muted-foreground">TKI</div>
                          <div className="text-lg font-medium">
                            {tkiResult.dominantModes[0] ?? "—"}
                          </div>

                          <div className="pt-2 text-sm text-muted-foreground">
                            Unlock your personalized learning path →
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" onClick={() => setStep("tki")}>
                            Back
                          </Button>
                          <Button
                            onClick={() => {
                              if (userEmail) {
                                setStep("signup");
                              } else {
                                setStep("signup");
                              }
                            }}
                          >
                            Continue
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}

                    {step === "signup" ? (
                      <motion.div
                        key="signup"
                        {...STEP_ANIMATION}
                        transition={{ duration: 0.35 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Step 6</div>
                          <h2 className="text-2xl font-semibold tracking-tight">
                            {userEmail ? "Save your profile" : "Sign up to unlock your path"}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {userEmail
                              ? "We’ll store your results and personalize AI tone and learning."
                              : "Create an account to save results, earn points, and unlock the dashboard."}
                          </p>
                        </div>

                        {saveError ? (
                          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                            {saveError}
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-3">
                          {userEmail ? (
                            <Button
                              disabled={isSaving || !role}
                              onClick={() => {
                                setSaveError(null);
                                startSaving(async () => {
                                  const res = await saveOnboarding({
                                    role,
                                    mbti: {
                                      type: mbtiResult.type,
                                      scores: mbtiResult.scores,
                                      responses: mbtiResponses,
                                    },
                                    tki: {
                                      scores: tkiResult.scores,
                                      dominantModes: tkiResult.dominantModes,
                                      responses: tkiResponses,
                                    },
                                  });

                                  if (!res.ok) {
                                    setSaveError(res.error);
                                    return;
                                  }

                                  setStep("done");
                                  router.push("/dashboard");
                                });
                              }}
                            >
                              Save and continue
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const supabase = createSupabaseBrowserClient();
                                    await supabase.auth.signInWithOAuth({
                                      provider: "google",
                                      options: {
                                        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
                                      },
                                    });
                                  } catch (err) {
                                    setSaveError(
                                      err instanceof Error ? err.message : "Google sign-in failed.",
                                    );
                                  }
                                }}
                              >
                                Continue with Google
                              </Button>
                              <Button variant="outline" asChild>
                                <Link href="/login">Continue with email</Link>
                              </Button>
                              <Button variant="ghost" asChild>
                                <Link href="/dashboard">Continue as guest</Link>
                              </Button>
                            </>
                          )}

                          <Button variant="outline" onClick={() => setStep("results")}>
                            Back
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

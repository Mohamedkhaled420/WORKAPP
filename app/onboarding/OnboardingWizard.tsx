"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MBTI_QUESTIONS, type MbtiChoice } from "@/lib/assessments/mbti";
import { TKI_QUESTIONS } from "@/lib/assessments/tki";
import { scoreMbti } from "@/lib/mbti";
import { scoreTki, type TkiChoice } from "@/lib/tki";

import { saveOnboarding } from "./actions";

type Step = "intro" | "mbti" | "tki" | "review" | "done";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [mbtiIndex, setMbtiIndex] = useState(0);
  const [mbtiResponses, setMbtiResponses] = useState<Record<number, MbtiChoice>>({});

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

  const mbtiResult = useMemo(() => {
    return scoreMbti(mbtiResponses, MBTI_QUESTIONS);
  }, [mbtiResponses]);

  const tkiResult = useMemo(() => {
    return scoreTki(tkiResponses);
  }, [tkiResponses]);

  const mbtiComplete = useMemo(
    () => Object.keys(mbtiResponses).length === MBTI_QUESTIONS.length,
    [mbtiResponses],
  );

  const tkiComplete = useMemo(
    () => Object.keys(tkiResponses).length === TKI_QUESTIONS.length,
    [tkiResponses],
  );

  if (step === "done") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding complete</CardTitle>
          <CardDescription>
            Your profile is saved. Next: generate a learning path or start a note.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/learning-paths">Learning paths</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/notes">Notes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {authError ? (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Auth not available: {authError}
        </div>
      ) : null}

      {step === "intro" ? (
        <Card>
          <CardHeader>
            <CardTitle>Smart onboarding</CardTitle>
            <CardDescription>
              Quick psychometrics so the AI can tone-match and personalize.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {userEmail ? (
                <p>
                  Signed in as <span className="text-foreground">{userEmail}</span>.
                </p>
              ) : (
                <p>
                  Not signed in. You can take the assessments now, then sign in to
                  save.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setStep("mbti")}>Start MBTI</Button>
              {!userEmail ? (
                <Button variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "mbti" ? (
        <Card>
          <CardHeader>
            <CardTitle>MBTI (simplified)</CardTitle>
            <CardDescription>
              Question {mbtiIndex + 1} of {MBTI_QUESTIONS.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const q = MBTI_QUESTIONS[mbtiIndex];
              return (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">
                    Choose the statement that fits you best.
                  </div>
                  <div className="grid gap-2">
                    <Button
                      variant={mbtiResponses[q.id] === "A" ? "default" : "outline"}
                      className="justify-start whitespace-normal"
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
                      variant={mbtiResponses[q.id] === "B" ? "default" : "outline"}
                      className="justify-start whitespace-normal"
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

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      variant="outline"
                      disabled={mbtiIndex === 0}
                      onClick={() => setMbtiIndex((i) => Math.max(0, i - 1))}
                    >
                      Back
                    </Button>

                    {mbtiComplete ? (
                      <Button onClick={() => setStep("tki")}>Continue to TKI</Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setMbtiIndex((i) => Math.min(MBTI_QUESTIONS.length - 1, i + 1))}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              Current type: <span className="font-medium">{mbtiResult.type}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "tki" ? (
        <Card>
          <CardHeader>
            <CardTitle>TKI (30 items)</CardTitle>
            <CardDescription>
              Question {tkiIndex + 1} of {TKI_QUESTIONS.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const q = TKI_QUESTIONS[tkiIndex];
              return (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">
                    Pick the option closer to how you handle conflict.
                  </div>
                  <div className="grid gap-2">
                    <Button
                      variant={tkiResponses[q.id] === "A" ? "default" : "outline"}
                      className="justify-start whitespace-normal"
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
                      variant={tkiResponses[q.id] === "B" ? "default" : "outline"}
                      className="justify-start whitespace-normal"
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

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      variant="outline"
                      disabled={tkiIndex === 0}
                      onClick={() => setTkiIndex((i) => Math.max(0, i - 1))}
                    >
                      Back
                    </Button>

                    {tkiComplete ? (
                      <Button onClick={() => setStep("review")}>Review</Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setTkiIndex((i) => Math.min(TKI_QUESTIONS.length - 1, i + 1))}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              Dominant mode(s):{" "}
              <span className="font-medium">{tkiResult.dominantModes.join(", ")}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "review" ? (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>
              Save your profile so the AI can personalize tone and learning paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
              <div>
                <span className="text-muted-foreground">MBTI:</span>{" "}
                <span className="font-medium">{mbtiResult.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">TKI:</span>{" "}
                <span className="font-medium">{tkiResult.dominantModes.join(", ")}</span>
              </div>
            </div>

            {!userEmail ? (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                Sign in to save: <Link className="underline" href="/login">/login</Link>
              </div>
            ) : null}

            {saveError ? (
              <p className="text-sm text-muted-foreground">{saveError}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setStep("tki")}>
                Back
              </Button>

              <Button
                disabled={!userEmail || isSaving}
                onClick={() => {
                  setSaveError(null);

                  startSaving(async () => {
                    const res = await saveOnboarding({
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
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

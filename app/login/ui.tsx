"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disabled = useMemo(() => !email.trim() || isPending, [email, isPending]);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus(null);

        startTransition(async () => {
          try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithOtp({
              email: email.trim(),
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
              },
            });

            if (error) {
              setStatus(error.message);
              return;
            }

            setStatus("Check your email for a sign-in link.");
          } catch (err) {
            setStatus(err instanceof Error ? err.message : "Sign-in failed.");
          }
        });
      }}
    >
      <Input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <Button type="submit" disabled={disabled} className="w-full">
        Send magic link
      </Button>

      {status ? (
        <p className="text-sm text-muted-foreground">{status}</p>
      ) : null}
    </form>
  );
}

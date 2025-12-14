"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createLearningPath } from "./actions";

export function NewLearningPathForm() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
          const res = await createLearningPath(goal);
          if (!res.ok) {
            setError(res.error);
            return;
          }

          router.push(`/learning-paths/${res.id}`);
          router.refresh();
        });
      }}
    >
      <Input
        placeholder='e.g., "Learn Python for Data Analysis"'
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <Button type="submit" disabled={isPending || !goal.trim()}>
        Generate
      </Button>
      {error ? (
        <p className="text-sm text-muted-foreground sm:col-span-2">{error}</p>
      ) : null}
    </form>
  );
}

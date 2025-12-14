"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  category: string | null;
  published_at: string | null;
}

export function AINewsCarousel({
  articles,
  className,
}: {
  articles: NewsArticle[];
  className?: string;
}) {
  const safeArticles = useMemo(() => articles.filter(Boolean), [articles]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (!safeArticles.length) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % safeArticles.length);
    }, 10_000);

    return () => clearInterval(id);
  }, [paused, safeArticles.length]);

  const active = safeArticles[index];

  if (!safeArticles.length || !active) {
    return (
      <div
        className={cn(
          "rounded-xl border bg-card p-6 text-sm text-muted-foreground",
          className,
        )}
      >
        No news yet.
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-xl border bg-card p-6", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Latest AI news</h2>
        <div className="flex gap-1">
          {safeArticles.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show article ${i + 1}`}
              className={cn(
                "h-2 rounded-full bg-muted transition-all",
                i === index ? "w-6 bg-primary" : "w-2",
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.a
            key={active.id}
            href={active.source_url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg border bg-background"
            initial={{ opacity: 0, x: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -24, filter: "blur(8px)" }}
            transition={{ duration: 0.35 }}
          >
            {active.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.image_url}
                alt={active.title}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-48 w-full bg-muted" />
            )}

            <div className="space-y-2 p-4">
              <div className="text-sm font-medium leading-5">{active.title}</div>
              {active.description ? (
                <div className="text-xs text-muted-foreground">
                  {active.description}
                </div>
              ) : null}
              <div className="text-xs text-muted-foreground">
                {active.published_at
                  ? new Date(active.published_at).toLocaleDateString()
                  : ""}
              </div>
            </div>
          </motion.a>
        </AnimatePresence>
      </div>
    </div>
  );
}

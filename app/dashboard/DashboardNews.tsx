"use client";

import { useEffect, useState } from "react";

import { AINewsCarousel, type NewsArticle } from "@/components/ai-news-carousel";

export function DashboardNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) return;
        const json = (await res.json()) as { articles?: NewsArticle[] };
        if (cancelled) return;
        setArticles(json.articles ?? []);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <AINewsCarousel articles={articles} />;
}

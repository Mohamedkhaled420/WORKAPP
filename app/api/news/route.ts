import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  category: string | null;
  published_at: string | null;
}

function fallbackArticles(): NewsArticle[] {
  return [
    {
      id: "fallback-1",
      title: "AI Work App is live: onboarding + learning paths + notes",
      description: "Scaffolded features with Supabase, Vercel AI SDK, and a minimalist UI.",
      image_url: null,
      source_url: "https://example.com",
      category: "Tools",
      published_at: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ articles: fallbackArticles(), source: "fallback" });
  }

  const cacheWindowMs = 2 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - cacheWindowMs).toISOString();

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseServiceClient()
      : await createSupabaseServerClient();

    const { data: cached } = await supabase
      .from("ai_news_cache")
      .select(
        "id,title,description,image_url,source_url,category,published_at,cached_at",
      )
      .gt("cached_at", cutoff)
      .order("published_at", { ascending: false })
      .limit(10);

    if (cached?.length) {
      return NextResponse.json({
        articles: cached as unknown as NewsArticle[],
        source: "cache",
      });
    }

    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      return NextResponse.json({ articles: fallbackArticles(), source: "fallback" });
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=artificial%20intelligence&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`,
      { next: { revalidate: 0 } },
    );

    if (!response.ok) {
      return NextResponse.json({ articles: fallbackArticles(), source: "fallback" });
    }

    const json = (await response.json()) as {
      articles?: Array<{
        title?: string;
        description?: string;
        urlToImage?: string;
        url?: string;
        publishedAt?: string;
      }>;
    };

    const articles = (json.articles ?? [])
      .map((a, idx) => {
        if (!a.title || !a.url) return null;
        return {
          id: `newsapi-${idx}-${Buffer.from(a.url).toString("base64url")}`,
          title: a.title,
          description: a.description ?? null,
          image_url: a.urlToImage ?? null,
          source_url: a.url,
          category: "AI",
          published_at: a.publishedAt ?? null,
        } satisfies NewsArticle;
      })
      .filter(Boolean) as NewsArticle[];

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = createSupabaseServiceClient();
      await service.from("ai_news_cache").upsert(
        articles.map((a) => ({
          title: a.title,
          description: a.description,
          image_url: a.image_url,
          source_url: a.source_url,
          category: a.category,
          published_at: a.published_at,
          cached_at: new Date().toISOString(),
        })),
        { onConflict: "title,source_url" },
      );
    }

    return NextResponse.json({ articles, source: "newsapi" });
  } catch {
    return NextResponse.json({ articles: fallbackArticles(), source: "fallback" });
  }
}

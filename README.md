# The AI Work App

A minimalist, Notion-style professional learning platform powered by:

- Next.js App Router + TypeScript
- Supabase (Auth + Postgres)
- Shadcn/UI + Tailwind
- Vercel AI SDK (optional)
- NewsAPI (optional)

## Local setup

### 1) Configure environment variables

Copy `.env.example` to `.env.local` and fill in values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (optional; enables server-side cache writes)
- `OPENAI_API_KEY` (optional; enables higher-quality AI transforms)
- `NEWSAPI_KEY` (optional; enables real AI news)

Do **not** commit secrets.

### 2) Set up Supabase schema + seed data

Run these SQL files in the Supabase **SQL Editor** (in this order):

1. `supabase/schema.sql`
2. `supabase/seed.sql`

This creates all core tables (users, assessments, courses_library, learning_paths, notes, badges, user_badges, ai_news_cache), RLS policies, and an RPC for the leaderboard.

### 3) Configure Supabase Auth redirect URLs

In Supabase → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - (add your production URL too when deploying)

Enable providers:

- Email (OTP)
- Google OAuth (optional)

### 4) Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Key routes

- `/` Landing
- `/onboarding` 3D liquid-glass onboarding (role + MBTI + TKI)
- `/dashboard` Workspace + gamification + news carousel
- `/learning-paths` Curated learning paths (from `courses_library`)
- `/notes` Tiptap editor + AI highlight toolbar
- `/dashboard/leaderboard` Leaderboard
- `/dashboard/achievements` Badges
- `/courses` Courses library

## Deployment

Ready to deploy? See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions on deploying to Vercel.

## Notes

- If AI keys are missing, the app falls back to lightweight deterministic behavior.
- If NewsAPI key is missing, the dashboard shows a fallback news item.

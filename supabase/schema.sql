-- The AI Work App (Supabase) - V0 schema (free forever)

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  create type public.assessment_type as enum ('mbti', 'tki');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  username text,
  avatar_url text,

  role text,

  mbti_type varchar(4),
  mbti_dimensions jsonb,

  tki_scores jsonb,
  tki_dominant_mode text,

  total_points int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_login_date date,

  onboarding_step int not null default 0,
  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  assessment_type public.assessment_type not null,
  responses jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists idx_assessments_user_id on public.assessments (user_id);
create index if not exists idx_assessments_user_id_type on public.assessments (user_id, assessment_type);

create table if not exists public.courses_library (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  source varchar(100) not null default 'linkedin',
  source_url varchar(500) not null,
  duration_weeks int,
  difficulty_level varchar(20),
  description text,
  mbti_fit jsonb,
  tki_fit jsonb,
  skills jsonb,
  prerequisites jsonb,
  why_for_mbti jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_courses_mbti_fit on public.courses_library using gin (mbti_fit);
create index if not exists idx_courses_tki_fit on public.courses_library using gin (tki_fit);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  path_name varchar(255),
  description text,
  courses jsonb not null default '[]'::jsonb,
  status varchar(20) not null default 'active',
  progress_percentage int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger learning_paths_set_updated_at
before update on public.learning_paths
for each row
execute function public.set_updated_at();

create index if not exists idx_learning_paths_user_id on public.learning_paths (user_id);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  learning_path_id uuid references public.learning_paths (id) on delete set null,
  course_id uuid references public.courses_library (id) on delete set null,
  title varchar(255) not null default '',
  content text,
  ai_summary text,
  ai_simplified text,
  action_items jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

create index if not exists idx_notes_user_id on public.notes (user_id);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  description text,
  icon_emoji varchar(10),
  icon_url varchar(500),
  requirement jsonb,
  points_reward int not null default 50,
  created_at timestamptz not null default now(),
  unique (name)
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  badge_id uuid references public.badges (id) on delete cascade not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists idx_user_badges_user_id on public.user_badges (user_id);

create table if not exists public.ai_news_cache (
  id uuid primary key default gen_random_uuid(),
  source varchar(100) not null default 'newsapi',
  title varchar(255) not null,
  description text,
  image_url varchar(500),
  source_url varchar(500) not null,
  category varchar(50),
  published_at timestamptz,
  cached_at timestamptz not null default now(),
  unique (title, source_url)
);

create index if not exists idx_news_cached_at on public.ai_news_cache (cached_at desc);

-- Auth signup provisioning
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Leaderboard (safe, RLS-bypassing) RPC
create or replace function public.get_leaderboard(limit_count int default 50)
returns table (
  id uuid,
  username text,
  avatar_url text,
  mbti_type varchar,
  total_points int,
  current_streak int,
  badges_earned int,
  global_rank bigint,
  streak_rank bigint
)
language sql
security definer
set search_path = public
as $$
  with base as (
    select
      u.id,
      u.username,
      u.avatar_url,
      u.mbti_type,
      u.total_points,
      u.current_streak,
      count(distinct ub.badge_id) as badges_earned
    from public.users u
    left join public.user_badges ub on u.id = ub.user_id
    where u.created_at >= now() - interval '30 days'
    group by u.id
  )
  select
    b.id,
    b.username,
    b.avatar_url,
    b.mbti_type,
    b.total_points,
    b.current_streak,
    b.badges_earned,
    row_number() over (order by b.total_points desc) as global_rank,
    row_number() over (order by b.current_streak desc) as streak_rank
  from base b
  order by global_rank
  limit limit_count;
$$;

grant execute on function public.get_leaderboard(int) to authenticated;

-- RLS
alter table public.users enable row level security;
alter table public.assessments enable row level security;
alter table public.learning_paths enable row level security;
alter table public.notes enable row level security;
alter table public.courses_library enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.ai_news_cache enable row level security;

-- Users: own profile only
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Assessments: per-user
drop policy if exists "Users can read own assessments" on public.assessments;
create policy "Users can read own assessments"
on public.assessments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own assessments" on public.assessments;
create policy "Users can create own assessments"
on public.assessments
for insert
to authenticated
with check (auth.uid() = user_id);

-- Learning paths: per-user
drop policy if exists "Users can read own learning paths" on public.learning_paths;
create policy "Users can read own learning paths"
on public.learning_paths
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own learning paths" on public.learning_paths;
create policy "Users can create own learning paths"
on public.learning_paths
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own learning paths" on public.learning_paths;
create policy "Users can update own learning paths"
on public.learning_paths
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Notes: per-user
drop policy if exists "Users can read own notes" on public.notes;
create policy "Users can read own notes"
on public.notes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own notes" on public.notes;
create policy "Users can create own notes"
on public.notes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on public.notes;
create policy "Users can update own notes"
on public.notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Courses and badges are readable to everyone (public catalog)
drop policy if exists "Anyone can read courses" on public.courses_library;
create policy "Anyone can read courses"
on public.courses_library
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can read badges" on public.badges;
create policy "Anyone can read badges"
on public.badges
for select
to anon, authenticated
using (true);

-- User badges: per-user
drop policy if exists "Users can read own user_badges" on public.user_badges;
create policy "Users can read own user_badges"
on public.user_badges
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own user_badges" on public.user_badges;
create policy "Users can create own user_badges"
on public.user_badges
for insert
to authenticated
with check (auth.uid() = user_id);

-- News cache: readable by everyone; writable by authenticated (or service role)
drop policy if exists "Anyone can read ai_news_cache" on public.ai_news_cache;
create policy "Anyone can read ai_news_cache"
on public.ai_news_cache
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can insert ai_news_cache" on public.ai_news_cache;
create policy "Authenticated can insert ai_news_cache"
on public.ai_news_cache
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update ai_news_cache" on public.ai_news_cache;
create policy "Authenticated can update ai_news_cache"
on public.ai_news_cache
for update
to authenticated
using (true)
with check (true);

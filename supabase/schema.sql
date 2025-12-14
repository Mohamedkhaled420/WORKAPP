-- The AI Work App (Supabase) - initial schema
--
-- Tables:
--  - public.users: app profile + psychometrics (MBTI/TKI)
--  - public.learning_paths: AI-generated curricula per user goal
--  - public.assessments: raw submissions + computed results

create extension if not exists "pgcrypto";

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  email text,
  full_name text,

  onboarding_step int not null default 0,
  onboarding_completed boolean not null default false,

  mbti_type text,
  mbti_dimensions jsonb,

  tki_competing int,
  tki_collaborating int,
  tki_compromising int,
  tki_avoiding int,
  tki_accommodating int,

  constraint tki_score_non_negative check (
    (tki_competing is null or tki_competing >= 0) and
    (tki_collaborating is null or tki_collaborating >= 0) and
    (tki_compromising is null or tki_compromising >= 0) and
    (tki_avoiding is null or tki_avoiding >= 0) and
    (tki_accommodating is null or tki_accommodating >= 0)
  )
);

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

do $$
begin
  create type public.assessment_type as enum ('mbti', 'tki');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type public.assessment_type not null,
  responses jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_id_idx on public.assessments (user_id);
create index if not exists assessments_user_id_type_idx on public.assessments (user_id, type);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text,
  goal text not null,
  curriculum jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger learning_paths_set_updated_at
before update on public.learning_paths
for each row
execute function public.set_updated_at();

create index if not exists learning_paths_user_id_idx on public.learning_paths (user_id);

-- Basic RLS
alter table public.users enable row level security;
alter table public.assessments enable row level security;
alter table public.learning_paths enable row level security;

-- Users can read/update their own profile
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

-- Assessments: CRUD per-user
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

-- Learning paths: CRUD per-user
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

-- Optional: auto-provision a public.users row on auth signup
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

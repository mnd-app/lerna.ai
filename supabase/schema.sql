create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  preferred_name text not null default '',
  preferred_language text not null default '',
  heard_from text not null default '',
  learner_type text not null default '',
  onboarding_completed boolean not null default false,
  uploads_used integer not null default 0,
  password_hash text not null default '',
  password_salt text not null default '',
  oauth_providers jsonb not null default '{}'::jsonb,
  verified boolean not null default false,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  topic_name text not null,
  source_type text not null check (source_type in ('audio', 'youtube', 'paste_notes', 'document')),
  notes_text text,
  youtube_url text,
  file_name text,
  explanation text,
  questions jsonb,
  flashcards jsonb,
  created_at timestamptz not null default now()
);

create index if not exists subjects_user_id_idx on public.subjects (user_id);
create index if not exists subjects_created_at_idx on public.subjects (created_at desc);

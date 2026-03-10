-- Supabase SQL Editor に貼り付けて実行してください
-- Table: submissions

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_url text null,
  instagram_account_name text not null,
  operation_months int not null,
  purpose text not null,
  answers_json jsonb not null,
  score int not null,
  level text not null
);

create index if not exists idx_submissions_created_at
  on public.submissions (created_at desc);

create index if not exists idx_submissions_instagram_account_name
  on public.submissions (instagram_account_name);


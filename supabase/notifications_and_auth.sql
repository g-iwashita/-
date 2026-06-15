-- 通知先メンバー & 管理画面の認証情報テーブル
-- Supabase SQL Editor に貼り付けて実行してください。

create extension if not exists "pgcrypto";

-- メール通知の送信先（管理画面のメンバー一覧ページで追加・削除する）
create table if not exists public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  label text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_recipients_created_at
  on public.notification_recipients (created_at desc);

-- 管理画面のログイン情報（admin / member の2アカウント）
-- パスワードはハッシュ化して保存する。
-- session_version はパスワード変更時に +1 して、既存ログインを失効させるために使う
-- （退職者が出たときにパスワードを変えると、その場で全員のログインが切れる仕組み）。
create table if not exists public.app_credentials (
  role text primary key check (role in ('admin', 'member')),
  password_hash text not null,
  session_version integer not null default 1,
  updated_at timestamptz not null default now()
);

-- これらのテーブルはサーバー側(service_role)からのみ操作する。
-- RLS を有効化しておくと anon キーからは一切アクセスできない（service_role は RLS をバイパスする）。
-- 特にパスワードを保持する app_credentials は必ず有効化しておくこと。
alter table public.notification_recipients enable row level security;
alter table public.app_credentials enable row level security;

-- Admin Banners schema for Supabase (Postgres)
-- Run this in Supabase SQL Editor or via Supabase CLI migrations

-- Extensions (gen_random_uuid for UUIDs)
create extension if not exists pgcrypto;

-- Table
create table if not exists public.admin_banners (
  id uuid primary key default gen_random_uuid(),
  image text not null,          -- Cloudinary secure_url
  color text not null,          -- Hex or Tailwind color token
  title text not null,          -- Banner heading/title
  "isActive" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

-- Helpful index for active lookups
create index if not exists admin_banners_is_active_idx on public.admin_banners("isActive");

-- Ensure only one active banner (optional, allows 0 or 1 active)
create unique index if not exists admin_banners_single_active_unique
  on public.admin_banners ((case when "isActive" then 1 else null end));

-- Enable RLS
alter table public.admin_banners enable row level security;

-- Policy: allow public (anon) to read only active banners
drop policy if exists "read active banners" on public.admin_banners;
create policy "read active banners"
  on public.admin_banners for select
  using ("isActive" = true);

-- Note: service role key bypasses RLS automatically for server-side writes
-- No insert/update policies are required for server-side operations using service role.
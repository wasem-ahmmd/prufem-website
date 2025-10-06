-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Enable RLS (optional): for admin app you may keep disabled
alter table public.categories enable row level security;

-- Simple policy to allow authenticated users read/write (adjust as needed)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'categories'
  ) then
    create policy categories_read on public.categories for select to authenticated using (true);
    create policy categories_write on public.categories for insert to authenticated with check (true);
    create policy categories_delete on public.categories for delete to authenticated using (true);
  end if;
end$$;
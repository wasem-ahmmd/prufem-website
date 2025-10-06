-- Create collections table with category relation
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'collections'
  ) then
    create policy collections_read on public.collections for select to authenticated using (true);
    create policy collections_write on public.collections for insert to authenticated with check (true);
    create policy collections_delete on public.collections for delete to authenticated using (true);
  end if;
end$$;
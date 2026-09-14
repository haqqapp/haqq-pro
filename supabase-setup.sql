-- In Supabase: SQL Editor -> New query -> alles einfügen -> Run

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.app_state enable row level security;

-- Nur eingeloggte Trainer dürfen den gemeinsamen App-Stand sehen und ändern.
drop policy if exists "authenticated trainers can read app state" on public.app_state;
create policy "authenticated trainers can read app state"
on public.app_state for select
to authenticated
using (true);

drop policy if exists "authenticated trainers can insert app state" on public.app_state;
create policy "authenticated trainers can insert app state"
on public.app_state for insert
to authenticated
with check (true);

drop policy if exists "authenticated trainers can update app state" on public.app_state;
create policy "authenticated trainers can update app state"
on public.app_state for update
to authenticated
using (true)
with check (true);

create or replace function public.touch_app_state_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_app_state_updated_at on public.app_state;
create trigger trg_touch_app_state_updated_at
before update on public.app_state
for each row execute function public.touch_app_state_updated_at();

-- Realtime für diese Tabelle einschalten.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table public.app_state;
  end if;
end $$;

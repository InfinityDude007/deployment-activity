-- Leaderboard table.
-- Reset between sessions:  truncate public.scores;

create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  name       text        not null check (char_length(trim(name)) between 1 and 24),
  score      integer     not null check (score between 0 and 5000),
  time_ms    integer     not null check (time_ms > 0),
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

-- Players (anon key) can read and add scores, but never edit or delete them.
drop policy if exists "scores are public" on public.scores;
create policy "scores are public" on public.scores
  for select to anon, authenticated using (true);

drop policy if exists "anyone can submit a score" on public.scores;
create policy "anyone can submit a score" on public.scores
  for insert to anon, authenticated with check (true);

grant select, insert on public.scores to anon, authenticated;

-- Live leaderboard updates.
do $$
begin
  alter publication supabase_realtime add table public.scores;
exception when duplicate_object then null;
end $$;

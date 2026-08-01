-- Anonymous usage analytics.
--
-- Storage budget is the binding constraint on Supabase free (500 MB). Raw
-- events are pruned to 30 days; `daily_rollup` keeps the long-term trend in a
-- few MB. The prune job is a safety valve, not housekeeping — writes fail hard
-- once the database is full.

create table if not exists public.events (
  id          bigserial primary key,
  ts          timestamptz not null default now(),
  install_id  uuid        not null,
  name        text        not null,
  props       jsonb       not null default '{}'::jsonb,
  app_version text
);

create index if not exists events_ts_idx on public.events (ts desc);
create index if not exists events_name_ts_idx on public.events (name, ts desc);
create index if not exists events_install_ts_idx on public.events (install_id, ts desc);

create table if not exists public.daily_rollup (
  day     date   not null,
  name    text   not null,
  count   bigint not null,
  uniques bigint not null,
  primary key (day, name)
);

-- Per-install, per-minute counter so a leaked ingest key can't fill the table.
create table if not exists public.ingest_throttle (
  install_id uuid        not null,
  minute     timestamptz not null,
  count      int         not null default 0,
  primary key (install_id, minute)
);

create index if not exists ingest_throttle_minute_idx
  on public.ingest_throttle (minute);

-- Only the service role (used by the Edge Function) may touch these tables.
-- No policies are defined, so anon/authenticated get nothing.
alter table public.events          enable row level security;
alter table public.daily_rollup    enable row level security;
alter table public.ingest_throttle enable row level security;

/**
 * Bump the caller's counter for the current minute and report whether they are
 * still under the limit. Returns true when the request should be allowed.
 */
create or replace function public.bump_ingest_throttle(
  p_install_id uuid,
  p_limit int default 20
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.ingest_throttle (install_id, minute, count)
  values (p_install_id, date_trunc('minute', now()), 1)
  on conflict (install_id, minute)
    do update set count = public.ingest_throttle.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

/**
 * Fold raw events into `daily_rollup` and drop anything past the retention
 * window. Idempotent — safe to re-run for the same day.
 */
create or replace function public.rollup_and_prune(
  p_retention_days int default 30
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_rollup (day, name, count, uniques)
  select
    date_trunc('day', ts)::date as day,
    name,
    count(*)                    as count,
    count(distinct install_id)  as uniques
  from public.events
  where ts >= date_trunc('day', now()) - interval '2 days'
    and ts <  date_trunc('day', now())
  group by 1, 2
  on conflict (day, name) do update
    set count = excluded.count,
        uniques = excluded.uniques;

  delete from public.events
  where ts < now() - make_interval(days => p_retention_days);

  delete from public.ingest_throttle
  where minute < now() - interval '1 hour';
end;
$$;

-- Nightly at 03:15 UTC. Requires the pg_cron extension to be enabled.
-- select cron.schedule('analytics-rollup', '15 3 * * *', $$select public.rollup_and_prune()$$);

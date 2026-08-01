# Usage analytics backend

Anonymous usage analytics for the app. Events are queued on-device, batched, and
POSTed to a Supabase Edge Function which writes them to Postgres.

```
app  ──track()──▶  MMKV queue  ──batch POST──▶  Edge Function ──▶  Postgres
                   (cap 500)      (≤100/req)      auth+throttle      events
                                                                       │
                                                            nightly rollup+prune
                                                                       ▼
                                                                 daily_rollup
```

| Piece | Where |
|---|---|
| Client layer | `src/lib/tracking/` |
| Event catalog | `src/lib/tracking/events.ts` (**the** source of truth) |
| Opt-out | `功能设置 → 使用数据统计`, stored in `$app$/settings` |
| Schema | `supabase/migrations/*_analytics.sql` |
| Ingest | `supabase/functions/ingest/` |

---

## Debugging against a remote Supabase project

Local Supabase (`supabase start`) needs ~5 GB of Docker images. If you're short
on disk, point a dev build at a real (throwaway) project instead.

> Use a **separate project** for debugging. Test events in your production
> dataset are worse than no dataset.

### 1. Create the project

<https://supabase.com/dashboard> → **New project** (Free). Copy the **project
ref** out of the dashboard URL — it's the segment after `/project/`:

```
https://supabase.com/dashboard/project/abcdefghijklmnopqrst
                                       ^^^^^^^^^^^^^^^^^^^^ this
```

> **Don't paste `<PLACEHOLDER>` into a shell.** `<` and `>` are redirection
> operators, so `--project-ref <PROJECT_REF>` fails with
> ``zsh: parse error near `>' ``. The commands below use shell variables
> instead — set them once and the rest copy-pastes as-is.

### 2. Link the CLI and push the schema

```bash
PROJECT_REF=abcdefghijklmnopqrst    # <- your ref, no angle brackets

supabase login
supabase link --project-ref "$PROJECT_REF"
supabase db push                    # applies supabase/migrations/
```

`supabase link` will prompt for the database password (the one set when the
project was created). It's only needed for `db push`, not for the app.

Verify in the dashboard → **Table Editor**: `events`, `daily_rollup`,
`ingest_throttle`.

### 3. Generate and set the ingest key

This is the shared secret the app sends as `x-ingest-key`. It is **not** a
Supabase key — it exists so a leaked anon key can't be used to write events.

```bash
INGEST_KEY=$(openssl rand -hex 32)
echo "$INGEST_KEY"                  # save this — you need it in .env below
supabase secrets set INGEST_KEY="$INGEST_KEY"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — do
not set them yourself.

### 4. Deploy the function

```bash
supabase functions deploy ingest --no-verify-jwt --use-api
```

- `--no-verify-jwt` is required: the app has no Supabase user, and the function
  does its own auth via `INGEST_KEY`.
- `--use-api` bundles server-side, so **no Docker is involved**. Without it the
  CLI pulls `public.ecr.aws/supabase/edge-runtime` to bundle locally, which is
  what fails with `toomanyrequests: Rate exceeded` (see Troubleshooting).

Smoke-test it before touching the app:

```bash
INGEST_URL="https://$PROJECT_REF.supabase.co/functions/v1/ingest"

curl -i -X POST "$INGEST_URL" \
  -H "content-type: application/json" \
  -H "x-ingest-key: $INGEST_KEY" \
  -d '{"install_id":"11111111-1111-4111-8111-111111111111",
       "app_version":"dev",
       "events":[{"n":"audio.play","p":{},"t":'"$(date +%s000)"'}]}'
```

Expect `200 {"inserted":1}`. Then check the auth actually rejects:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$INGEST_URL" \
  -H "content-type: application/json" -H "x-ingest-key: wrong" -d '{}'
# expect 401
```

### 5. Point the app at it

Append to `.env` (gitignored) — literal values, no angle brackets and no quotes:

```sh
ANALYTICS_INGEST_URL=https://abcdefghijklmnopqrst.supabase.co/functions/v1/ingest
ANALYTICS_INGEST_KEY=paste-the-hex-key-from-step-3
ANALYTICS_DEBUG_INGEST=1
```

Or write it straight from the shell variables you already set:

```bash
cat >> .env <<EOF
ANALYTICS_INGEST_URL=$INGEST_URL
ANALYTICS_INGEST_KEY=$INGEST_KEY
ANALYTICS_DEBUG_INGEST=1
EOF
```

**`ANALYTICS_DEBUG_INGEST=1` is the important one.** Without it a dev build only
prints to the console and never POSTs (`resolveSink()` in
`src/lib/tracking/sink.ts`). With it you get *both* — console output and a real
POST — so you can see exactly what was sent.

`app.config.ts` reads `.env` at config-evaluation time, so **restart Metro with
a cleared cache** after editing it:

```bash
npx expo start --dev-client --clear
```

### 6. Watch it work

Events flush when 25 accumulate, every 60s, or on app background — background
the app to force one. In the Metro logs:

```
[track] session.start {"app_version":"1.11.0","os":"ios","os_version":"18.5"}
[track] nav.session_routes {"routes":{"/feed":1},"total":1}
```

Then in the dashboard **SQL Editor**:

```sql
select ts, name, props, app_version
from events order by ts desc limit 50;
```

If rows don't appear, check `supabase functions logs ingest`.

---

## Scheduling the rollup

Raw events are pruned to 30 days; `daily_rollup` keeps the long-term trend. **On
the free tier this is a safety valve, not housekeeping** — 500 MB fills at
roughly 1.7M rows and writes fail hard once it's full.

Dashboard → **Database → Extensions** → enable `pg_cron`, then in the SQL
Editor:

```sql
select cron.schedule(
  'analytics-rollup',
  '15 3 * * *',
  $$select public.rollup_and_prune()$$
);
```

Check it: `select * from cron.job;`. Run it by hand any time with
`select public.rollup_and_prune();` — it's idempotent.

---

## Useful queries

```sql
-- daily active installs
select date_trunc('day', ts)::date as day, count(distinct install_id) as dau
from events group by 1 order by 1 desc;

-- which features actually get used (last 7 days)
select name, count(*) as n, count(distinct install_id) as installs
from events where ts > now() - interval '7 days'
group by 1 order by installs desc;

-- AI chat reliability + latency
select
  count(*) filter (where name = 'ai.stream_completed') as ok,
  count(*) filter (where name = 'ai.stream_failed')    as failed,
  round(avg((props->>'ttft_ms')::numeric) filter (where name = 'ai.stream_completed')) as avg_ttft_ms
from events where ts > now() - interval '7 days';

-- why streams fail
select props->>'reason' as reason, count(*)
from events where name = 'ai.stream_failed'
group by 1 order by 2 desc;

-- long-term trend (survives the 30-day prune)
select day, name, count, uniques from daily_rollup order by day desc limit 100;

-- storage headroom
select pg_size_pretty(pg_total_relation_size('events')) as events_size,
       (select count(*) from events) as rows;
```

---

## Troubleshooting

### `toomanyrequests: Rate exceeded` pulling `public.ecr.aws/supabase/edge-runtime`

This is **AWS ECR Public**, not Docker Hub — anonymous pulls are rate-limited
per source IP. It's transient and resets within minutes.

You almost certainly don't need the image. The entire remote workflow above is
Docker-free:

| Command | Needs Docker? |
|---|---|
| `supabase link` | no |
| `supabase db push` | no |
| `supabase functions deploy --use-api` | **no** |
| `supabase functions deploy` (without `--use-api`) | yes — bundles locally |
| `supabase functions serve` | yes — runs edge-runtime locally |
| `supabase start` | yes — the full stack |

So: add `--use-api` and the problem disappears. If you genuinely want a local
edge runtime, authenticating raises the ECR limit substantially:

```bash
aws ecr-public get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin public.ecr.aws
```

### `no space left on device` during `supabase start`

The full local stack needs several GB of images. Check headroom with
`df -h /System/Volumes/Data` and `docker system df`. Reclaiming space with
`docker system prune` will delete images/volumes belonging to **other**
projects, so check what you'd lose first. Using a remote project (this guide)
avoids the problem entirely.

### Verifying the SQL without Docker

The migration is plain Postgres and runs against a local server:

```bash
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
initdb -D /tmp/pgtest -U postgres --auth=trust
pg_ctl -D /tmp/pgtest -o "-p 55432 -k /tmp" start
createdb -h /tmp -p 55432 -U postgres analytics_test
psql -h /tmp -p 55432 -U postgres -d analytics_test \
  -v ON_ERROR_STOP=1 -f supabase/migrations/*_analytics.sql

# then exercise the functions
psql -h /tmp -p 55432 -U postgres -d analytics_test \
  -c "select public.bump_ingest_throttle('11111111-1111-4111-8111-111111111111');" \
  -c "select public.rollup_and_prune();"

pg_ctl -D /tmp/pgtest stop && rm -rf /tmp/pgtest
```

The Edge Function can be type-checked and run standalone too:

```bash
cd supabase/functions/ingest
deno check --node-modules-dir=none index.ts
INGEST_KEY=test SUPABASE_URL=http://127.0.0.1:1 SUPABASE_SERVICE_ROLE_KEY=x \
  deno run --allow-net --allow-env --node-modules-dir=none index.ts
# listens on :8000 — all auth/validation paths work without a database
```

## Gotchas

- **Free projects pause after 1 week of inactivity.** Harmless once real users
  send events daily; annoying during development. Unpause from the dashboard.
- **Adding an event needs two edits.** `src/lib/tracking/events.ts` *and* the
  `ALLOWED_EVENTS` set in `supabase/functions/ingest/index.ts` — the function
  silently drops unknown names, by design.
- **Never put content in `props`.** No usernames, titles, message text or search
  terms. Buckets and enums only; use `lengthBucket()` for sizes. This is what
  `privacy_policy.md` promises.
- **The throttle is 20 requests/minute per install**, tuned for a client that
  batches. If you see `429`, the client is flushing too often — fix the client,
  don't raise the limit.
- **EAS builds don't read `.env`.** For staging/production add the vars to the
  matching `env` block in `eas.json` (and never set `ANALYTICS_DEBUG_INGEST`
  there — production uses the HTTP sink already).

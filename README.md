# GID Education Session Activity
### Operation Midnight Deploy
DevOps themed virtual escape room

The AIESEC opportunities portal crashed hours before a global recruitment drive. Players are bounty hunters who must containerise it, push it to GHCR, fix its GitHub Actions pipeline and wire up its databases. Four locked rooms, a 20-minute clock, and a live leaderboard. Built for complete beginners: no Docker install needed, everything runs in a simulated terminal.

| Room | Topic | Puzzles |
| --- | --- | --- |
| The Dockyard | Docker | Repair a Dockerfile, `docker build` + `docker run` |
| The Registry Vault | GHCR | `docker tag` / `login` / `push`, then `pull` on a teammate's laptop |
| The Pipeline Lab | GitHub Actions + YAML | Read a trigger, spot 4 sabotaged YAML lines, order the pipeline |
| The Data Crypt | MongoDB / Supabase / ClickHouse | Pick the right DB for 3 jobs, keep secrets out of images |

Each room awards a keycard fragment; together they spell the master code for the final door.

## Scoring
- Puzzles are worth 100–200 pts. Wrong answers −10 (−5 for terminal typos); hints −20 then −40. A puzzle never drops below 25% of its value.
- Final door: 50 pts (−10 per wrong code).
- Speed bonus: up to +500, draining to 0 over the 20-minute countdown.
- Leaderboard ranks by score, then time. Only each name's **first** run counts.

Tweak numbers in `app/app/game/lib/scoring.ts`; edit puzzle content in `app/app/game/content/*.ts`.

## Setup

Requires **Node ≥ 22.22** (React Router v8). `nvm use` picks up `app/.nvmrc`.

### 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor → run [`supabase/schema.sql`](supabase/schema.sql).
3. Project Settings → API → copy the Project URL and the **anon/publishable** key (never `service_role`).

### 2. Environment
Copy `app/.env.example` to `app/.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_BOARD_PASSWORD_HASH=...
```

Generate the board password hash with:

```bash
printf '%s' 'your-admin-password' | shasum -a 256
```

Everything `VITE_*` is public in the browser bundle. That's fine for the anon key (RLS only allows reading and inserting scores) and for the hash, but the `/board` gate is a soft lock to stop players peeking, not real security.

### 3. Run locally
```bash
cd app && npm install && npm run dev
```
- Game: http://localhost:5173
- Projector leaderboard: http://localhost:5173/board (password protected)
- Reset your own run while testing: http://localhost:5173/?reset

### 4. Deploy to Vercel
1. Import the repo in Vercel and set **Root Directory** to `app`.
2. Add the three `VITE_*` environment variables.
3. Deploy. `app/vercel.json` builds the static SPA into `build/client` and rewrites all routes to `index.html`.

## On the day
- Put `/board` on the projector; share the game URL (QR code works well).
- Before the session, clear test runs in Supabase: `truncate public.scores;`

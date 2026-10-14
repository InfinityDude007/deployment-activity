import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "./+types/board";
import { boardGateConfigured, boardUnlocked, checkBoardPassword, lockBoard } from "../game/lib/admin";
import { Leaderboard, useScores } from "../game/components/Leaderboard";
import { Logo } from "../game/components/Logo";
import { Button, Eyebrow, Feedback, Panel } from "../game/components/ui";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Bounty Board · Operation Midnight Deploy" }, { name: "robots", content: "noindex" }];
}

export default function Board() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  useEffect(() => setUnlocked(boardUnlocked()), []);

  if (unlocked === null) return null;
  return unlocked ? (
    <LiveBoard
      onLock={() => {
        lockBoard();
        setUnlocked(false);
      }}
    />
  ) : (
    <Gate onUnlock={() => setUnlocked(true)} />
  );
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await checkBoardPassword(pw);
    setBusy(false);
    if (ok) onUnlock();
    else {
      setErr("ACCESS DENIED");
      setPw("");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Panel>
        <Logo className="mb-4 h-12 w-12" />
        <Eyebrow>Restricted · Organisers only</Eyebrow>
        <h1 className="mt-2 text-2xl font-bold text-white">Bounty Board</h1>
        {!boardGateConfigured ? (
          <div className="mt-4">
            <Feedback tone="bad">
              No admin password set. Add <code>VITE_BOARD_PASSWORD_HASH</code> to the environment and rebuild.
            </Feedback>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label htmlFor="admin-pw" className="block font-mono text-xs uppercase tracking-widest text-dim">
              Admin password
            </label>
            <input
              id="admin-pw"
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr(null);
              }}
              autoFocus
              className={`min-h-11 w-full rounded-md border bg-ink px-4 font-mono text-white outline-none focus:border-neon ${err ? "border-danger" : "border-line"}`}
            />
            {err && <p className="font-mono text-sm text-danger">{err}</p>}
            <Button type="submit" className="w-full" disabled={!pw || busy}>
              Unlock board
            </Button>
          </form>
        )}
      </Panel>
    </main>
  );
}

function LiveBoard({ onLock }: { onLock: () => void }) {
  const { rows, error } = useScores();
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.host), []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center gap-5">
        <Logo className="h-16 w-16" />
        <div className="flex-1">
          <Eyebrow>Live · Bounty Board</Eyebrow>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Operation <span className="text-neon">Midnight Deploy</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-widest text-dim">Play at</p>
          <p className="font-mono text-2xl text-cyan">{origin}</p>
          <p className="mt-1 font-mono text-sm text-dim">{rows ? `${rows.length} escaped` : "…"}</p>
        </div>
      </header>
      {error ? (
        <Feedback tone="bad">{error}</Feedback>
      ) : rows ? (
        <Leaderboard rows={rows} big limit={20} />
      ) : (
        <p className="text-dim">Loading scores…</p>
      )}
      <button onClick={onLock} className="mt-10 font-mono text-xs text-dim/50 hover:text-dim">
        lock board
      </button>
    </main>
  );
}

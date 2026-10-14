import { useEffect, useRef, useState } from "react";
import { ROOMS } from "../content";
import type { Run } from "../lib/run";
import { finalDoorScore, formatClock, speedBonus } from "../lib/scoring";
import { errorMessage, submitScore, supabase } from "../lib/supabase";
import { useScores } from "./Leaderboard";
import { Button, Eyebrow, Feedback, Panel } from "./ui";

export function totalScore(run: Run) {
  const elapsed = (run.finishedAt ?? Date.now()) - (run.startedAt ?? Date.now());
  const puzzles = Object.values(run.results).reduce((s, r) => s + r.points, 0);
  const door = finalDoorScore(run.finalWrong);
  const speed = speedBonus(elapsed);
  return { elapsed, puzzles, door, speed, total: puzzles + door + speed };
}

export function Escape({ run, onSubmitted }: { run: Run; onSubmitted: () => void }) {
  const s = totalScore(run);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);

  async function send() {
    if (sending.current || run.submitted || !supabase) return;
    sending.current = true;
    setStatus("sending");
    try {
      await submitScore(run.name, s.total, Math.max(1, Math.round(s.elapsed)));
      onSubmitted();
      setStatus("idle");
    } catch (e) {
      setError(errorMessage(e));
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  useEffect(() => {
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomPoints = ROOMS.map((r) => ({
    room: r,
    pts: r.puzzles.reduce((sum, p) => sum + (run.results[p.id]?.points ?? 0), 0),
    max: r.puzzles.reduce((sum, p) => sum + p.points, 0),
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="text-center">
        <p className="pop-in font-mono text-sm tracking-[0.4em] text-neon">● PORTAL ONLINE</p>
        <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">You escaped, {run.name}.</h1>
        <p className="mt-3 text-dim">The portal is containerised, in the vault, auto-deployed and wired to its data. Sunrise is safe.</p>
      </div>

      <Panel>
        <div className="flex items-baseline justify-between">
          <Eyebrow>Bounty payout</Eyebrow>
          <span className="font-mono text-sm text-dim">time {formatClock(s.elapsed)}</span>
        </div>
        <ul className="mt-4 space-y-2 font-mono text-sm">
          {roomPoints.map(({ room, pts, max }) => (
            <li key={room.id} className="flex justify-between">
              <span className="text-fg/90">{room.name}</span>
              <span>
                <span className="text-neon">{pts}</span>
                <span className="text-dim">/{max}</span>
              </span>
            </li>
          ))}
          <li className="flex justify-between">
            <span className="text-fg/90">Final door</span>
            <span className="text-neon">{s.door}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-fg/90">Speed bonus</span>
            <span className="text-neon">+{s.speed}</span>
          </li>
          <li className="flex justify-between border-t border-line pt-3 text-xl font-bold">
            <span className="text-white">Total</span>
            <span className="text-amber">{s.total}</span>
          </li>
        </ul>
      </Panel>

      {!supabase ? (
        <Feedback tone="info">Leaderboard not configured. Show this screen to the organisers!</Feedback>
      ) : status === "error" ? (
        <Feedback tone="bad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Couldn't submit your score: {error}</span>
            <Button variant="ghost" onClick={send}>
              Retry
            </Button>
          </div>
        </Feedback>
      ) : status === "sending" ? (
        <Feedback tone="info">Transmitting your score to HQ…</Feedback>
      ) : (
        <Rank name={run.name} />
      )}
    </div>
  );
}

function Rank({ name }: { name: string }) {
  const { rows } = useScores();
  if (!rows) return <Feedback tone="info">Score submitted. Checking your rank…</Feedback>;
  const i = rows.findIndex((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase());
  return (
    <Panel className="text-center">
      <Eyebrow>Score submitted</Eyebrow>
      {i >= 0 ? (
        <p className="mt-3 text-2xl font-bold text-white">
          You're currently <span className="text-amber">#{i + 1}</span> of {rows.length}
        </p>
      ) : (
        <p className="mt-3 text-white">Your score is on the board.</p>
      )}
      <p className="mt-2 text-sm text-dim">Eyes on the big screen for the final reveal 👀</p>
    </Panel>
  );
}

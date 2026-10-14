import { useEffect, useState } from "react";
import { ROOMS } from "../content";
import { COUNTDOWN_MS, formatClock } from "../lib/scoring";
import type { Run } from "../lib/run";
import { Logo } from "./Logo";

function useNow(active: boolean) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!active) return;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [active]);
    return now;
}

export function Hud({ run, score }: { run: Run; score: number }) {
    const now = useNow(Boolean(run.startedAt && !run.finishedAt));
    const elapsed = run.startedAt ? (run.finishedAt ?? now) - run.startedAt : 0;
    const left = COUNTDOWN_MS - elapsed;
    const overtime = left < 0;
    const roomsDone =
        run.phase === "final" || run.phase === "escaped"
            ? ROOMS.length
            : run.room + (run.phase === "cleared" ? 1 : 0);

    return (
        <header className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <Logo className="h-7 w-7" />
                    <span className="hidden font-mono text-xs font-bold tracking-widest text-fg sm:inline">
                        MIDNIGHT DEPLOY
                    </span>
                </div>
                <div className="truncate font-mono text-xs text-dim">
                    hunter: <span className="text-fg">{run.name}</span>
                </div>
                <div className="ml-auto flex items-center gap-4 font-mono text-sm">
                    <div className="flex gap-1" aria-label="Keycard fragments">
                        {ROOMS.map((r, i) => (
                            <span
                                key={r.id}
                                className={`rounded border px-1.5 py-0.5 text-xs ${i < roomsDone ? "border-neon/60 bg-neon/10 text-neon" : "border-line text-dim/40"}`}
                            >
                                {i < roomsDone ? r.fragment : "··"}
                            </span>
                        ))}
                    </div>
                    <span className="text-amber">
                        {score}
                        <span className="text-xs text-dim"> pts</span>
                    </span>
                    {run.startedAt && (
                        <span
                            className={`tabular-nums ${overtime ? "text-danger" : left < 3 * 60_000 ? "animate-pulse text-amber" : "text-neon"}`}
                            title="Countdown: finishing faster earns a bigger speed bonus"
                        >
                            {overtime
                                ? `+${formatClock(left)}`
                                : formatClock(left)}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}

import { useEffect, useState } from "react";
import {
    errorMessage,
    fetchScores,
    subscribeScores,
    supabase,
    type ScoreRow,
} from "../lib/supabase";
import { formatClock } from "../lib/scoring";

/** Live scores: initial fetch + realtime + a slow poll as a safety net. */
export function useScores() {
    const [rows, setRows] = useState<ScoreRow[] | null>(null);
    const [error, setError] = useState<string | null>(
        supabase
            ? null
            : "Leaderboard not configured (missing VITE_SUPABASE_* env vars).",
    );

    useEffect(() => {
        if (!supabase) return;
        let alive = true;
        const load = async () => {
            try {
                const data = await fetchScores();
                if (alive) {
                    setRows(data);
                    setError(null);
                }
            } catch (e) {
                if (alive) setError(errorMessage(e));
            }
        };
        load();
        const unsub = subscribeScores(load);
        const poll = setInterval(load, 15_000);
        return () => {
            alive = false;
            unsub();
            clearInterval(poll);
        };
    }, []);

    return { rows, error };
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({
    rows,
    big = false,
    limit = 50,
}: {
    rows: ScoreRow[];
    big?: boolean;
    limit?: number;
}) {
    if (!rows.length)
        return (
            <p className="py-8 text-center text-dim">
                No hunters have escaped yet...
            </p>
        );
    return (
        <ol className={big ? "space-y-2" : "space-y-1.5"}>
            {rows.slice(0, limit).map((r, i) => (
                <li
                    key={r.id}
                    className={`pop-in flex items-center gap-4 rounded-lg border px-4 ${big ? "py-3 text-2xl" : "py-2 text-sm"} ${
                        i === 0
                            ? "border-amber/60 bg-amber/10"
                            : "border-line bg-panel2/70"
                    }`}
                >
                    <span
                        className={`w-10 shrink-0 text-center font-mono ${i < 3 ? "" : "text-dim"}`}
                    >
                        {MEDALS[i] ?? `#${i + 1}`}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-white">
                        {r.name}
                    </span>
                    <span className="font-mono tabular-nums text-dim">
                        {formatClock(r.time_ms)}
                    </span>
                    <span
                        className={`w-24 text-right font-mono font-bold tabular-nums ${i === 0 ? "text-amber" : "text-neon"}`}
                    >
                        {r.score}
                    </span>
                </li>
            ))}
        </ol>
    );
}

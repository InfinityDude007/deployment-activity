import type { Attempt } from "./scoring";

export type Phase = "name" | "story" | "brief" | "puzzle" | "cleared" | "final" | "escaped";

export type Run = {
  v: 1;
  phase: Phase;
  name: string;
  startedAt: number | null;
  finishedAt: number | null;
  room: number;
  puzzle: number;
  current: Attempt;
  results: Record<string, Attempt & { points: number }>;
  finalWrong: number;
  submitted: boolean;
};

const KEY = "omd-run-v1";

export const freshAttempt = (): Attempt => ({ wrong: 0, penalty: 0, hintCost: 0 });

export const freshRun = (): Run => ({
  v: 1,
  phase: "name",
  name: "",
  startedAt: null,
  finishedAt: null,
  room: 0,
  puzzle: 0,
  current: freshAttempt(),
  results: {},
  finalWrong: 0,
  submitted: false,
});

export function loadRun(): Run | null {
  try {
    const raw = localStorage.getItem(KEY);
    const run = raw ? (JSON.parse(raw) as Run) : null;
    return run?.v === 1 ? run : null;
  } catch {
    return null;
  }
}

export function saveRun(run: Run) {
  try {
    localStorage.setItem(KEY, JSON.stringify(run));
  } catch {
    // private mode etc. — game still works, just won't survive a refresh
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

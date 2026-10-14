export const COUNTDOWN_MS = 20 * 60 * 1000;
export const HINT_COSTS = [20, 40];
export const WRONG_PENALTY = 10;
export const TERMINAL_WRONG_PENALTY = 5;
export const SPEED_BONUS_MAX = 500;
export const FINAL_DOOR_POINTS = 50;

export type Attempt = { wrong: number; penalty: number; hintCost: number };

/** Points for a solved puzzle: never below 25% of its value. */
export function puzzleScore(base: number, a: Attempt): number {
  return Math.max(Math.round(base * 0.25), base - a.penalty - a.hintCost);
}

/** Linear bonus that drains to 0 over the countdown. */
export function speedBonus(elapsedMs: number): number {
  return Math.max(0, Math.round(SPEED_BONUS_MAX * (1 - elapsedMs / COUNTDOWN_MS)));
}

export function finalDoorScore(wrong: number): number {
  return Math.max(10, FINAL_DOOR_POINTS - 10 * wrong);
}

export function formatClock(ms: number): string {
  const s = Math.floor(Math.abs(ms) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

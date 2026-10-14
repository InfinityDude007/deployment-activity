// Client-only soft gate for /board. Only a SHA-256 hash of the password ships in the bundle,
// but anyone determined could still read scores via the public anon key — this just keeps
// players from peeking at the projector view.
const HASH = (import.meta.env.VITE_BOARD_PASSWORD_HASH as string | undefined)?.trim().toLowerCase();
const KEY = "omd-board-unlocked";

export const boardGateConfigured = Boolean(HASH);

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkBoardPassword(pw: string): Promise<boolean> {
  if (!HASH) return false;
  const ok = (await sha256(pw)) === HASH;
  if (ok) {
    try {
      sessionStorage.setItem(KEY, HASH);
    } catch {}
  }
  return ok;
}

export function boardUnlocked(): boolean {
  try {
    return Boolean(HASH) && sessionStorage.getItem(KEY) === HASH;
  } catch {
    return false;
  }
}

export function lockBoard() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

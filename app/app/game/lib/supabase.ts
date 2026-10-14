import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
    url && key
        ? createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;

export function errorMessage(e: unknown): string {
    const err = e as { message?: string; code?: string } | null;
    if (err?.code === "PGRST205")
        return "The scores table doesn't exist yet. Run supabase/schema.sql in the Supabase SQL editor.";
    return err?.message ?? "Unknown error";
}

export type ScoreRow = {
    id: number;
    name: string;
    score: number;
    time_ms: number;
    created_at: string;
};

export async function submitScore(name: string, score: number, timeMs: number) {
    if (!supabase) throw new Error("Leaderboard is not configured.");
    const { error } = await supabase
        .from("scores")
        .insert({ name, score, time_ms: timeMs });
    if (error) throw error;
}

/** All scores, keeping only each name's first run */
export async function fetchScores(): Promise<ScoreRow[]> {
    if (!supabase) throw new Error("Leaderboard is not configured.");
    const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(2000);
    if (error) throw error;
    const seen = new Set<string>();
    const firsts = (data as ScoreRow[]).filter((r) => {
        const k = r.name.trim().toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
    return firsts.sort((a, b) => b.score - a.score || a.time_ms - b.time_ms);
}

export function subscribeScores(onChange: () => void): () => void {
    if (!supabase) return () => {};
    const client = supabase;
    const channel = client
        .channel(`scores-${Math.random().toString(36).slice(2)}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "scores" },
            () => onChange(),
        )
        .subscribe();
    return () => {
        client.removeChannel(channel);
    };
}

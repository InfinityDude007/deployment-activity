import { useEffect, useState } from "react";
import { ROOMS } from "./content";
import {
    clearRun,
    freshAttempt,
    freshRun,
    loadRun,
    saveRun,
    type Run,
} from "./lib/run";
import { WRONG_PENALTY, puzzleScore } from "./lib/scoring";
import { Hud } from "./components/Hud";
import { PuzzleView } from "./components/PuzzleView";
import {
    Briefing,
    FinalDoor,
    NameScreen,
    RoomCleared,
    StoryScreen,
} from "./components/Screens";
import { Escape, totalScore } from "./components/Escape";

export function Game() {
    const [run, setRun] = useState<Run | null>(null);

    // Load on the client only (SPA build prerenders without window).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("reset")) {
            clearRun();
            window.history.replaceState(null, "", window.location.pathname);
        }
        setRun(loadRun() ?? freshRun());
    }, []);

    useEffect(() => {
        if (run) saveRun(run);
    }, [run]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [run?.phase, run?.room, run?.puzzle]);

    if (!run) return null;

    const update = (fn: (r: Run) => Partial<Run>) =>
        setRun((r) => (r ? { ...r, ...fn(r) } : r));
    const room = ROOMS[run.room];
    const puzzle = room.puzzles[run.puzzle];
    const score =
        run.phase === "escaped"
            ? totalScore(run).total
            : Object.values(run.results).reduce((s, r) => s + r.points, 0);

    let screen;
    switch (run.phase) {
        case "name":
            return (
                <NameScreen
                    onStart={(name) => update(() => ({ phase: "story", name }))}
                />
            );
        case "story":
            screen = (
                <StoryScreen
                    name={run.name}
                    onAccept={() =>
                        update(() => ({
                            phase: "brief",
                            startedAt: Date.now(),
                            room: 0,
                        }))
                    }
                />
            );
            break;
        case "brief":
            screen = (
                <Briefing
                    room={room}
                    index={run.room}
                    onEnter={() =>
                        update(() => ({
                            phase: "puzzle",
                            puzzle: 0,
                            current: freshAttempt(),
                        }))
                    }
                />
            );
            break;
        case "puzzle":
            screen = (
                <PuzzleView
                    room={room}
                    roomIndex={run.room}
                    puzzleIndex={run.puzzle}
                    attempt={run.current}
                    earned={run.results[puzzle.id]?.points ?? null}
                    onWrong={(penalty = WRONG_PENALTY) =>
                        update((r) => ({
                            current: {
                                ...r.current,
                                wrong: r.current.wrong + 1,
                                penalty: r.current.penalty + penalty,
                            },
                        }))
                    }
                    onHint={(cost) =>
                        update((r) => ({
                            current: {
                                ...r.current,
                                hintCost: r.current.hintCost + cost,
                            },
                        }))
                    }
                    onSolved={() =>
                        update((r) => {
                            const p = ROOMS[r.room].puzzles[r.puzzle];
                            if (r.results[p.id]) return {};
                            return {
                                results: {
                                    ...r.results,
                                    [p.id]: {
                                        ...r.current,
                                        points: puzzleScore(
                                            p.points,
                                            r.current,
                                        ),
                                    },
                                },
                            };
                        })
                    }
                    onNext={() =>
                        update((r) =>
                            r.puzzle + 1 < ROOMS[r.room].puzzles.length
                                ? {
                                      puzzle: r.puzzle + 1,
                                      current: freshAttempt(),
                                  }
                                : { phase: "cleared" },
                        )
                    }
                />
            );
            break;
        case "cleared":
            screen = (
                <RoomCleared
                    room={room}
                    index={run.room}
                    points={room.puzzles.reduce(
                        (s, p) => s + (run.results[p.id]?.points ?? 0),
                        0,
                    )}
                    onNext={() =>
                        update((r) =>
                            r.room + 1 < ROOMS.length
                                ? { room: r.room + 1, phase: "brief" }
                                : { phase: "final" },
                        )
                    }
                />
            );
            break;
        case "final":
            screen = (
                <FinalDoor
                    wrong={run.finalWrong}
                    onWrong={() =>
                        update((r) => ({ finalWrong: r.finalWrong + 1 }))
                    }
                    onOpen={() =>
                        update(() => ({
                            phase: "escaped",
                            finishedAt: Date.now(),
                        }))
                    }
                />
            );
            break;
        case "escaped":
            screen = (
                <Escape
                    run={run}
                    onSubmitted={() => update(() => ({ submitted: true }))}
                />
            );
            break;
    }

    return (
        <>
            <Hud run={run} score={score} />
            <main>{screen}</main>
        </>
    );
}

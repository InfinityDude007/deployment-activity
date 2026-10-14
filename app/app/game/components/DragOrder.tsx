import { useState } from "react";
import type { OrderPuzzle, PuzzleProps } from "../types";
import { Button, Feedback, HintBar, Rich } from "./ui";

export function DragOrder({
    puzzle,
    solved,
    onWrong,
    onHint,
    onSolved,
}: PuzzleProps<OrderPuzzle>) {
    const [order, setOrder] = useState<number[]>(() =>
        solved ? puzzle.items.map((_, i) => i) : puzzle.start,
    );
    const [dragFrom, setDragFrom] = useState<number | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    function move(from: number, to: number) {
        if (solved || to < 0 || to >= order.length || from === to) return;
        setMsg(null);
        setOrder((o) => {
            const next = o.slice();
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    }

    function check() {
        const right = order.filter((item, pos) => item === pos).length;
        if (right === order.length) onSolved();
        else {
            onWrong();
            setMsg(`${right} of ${order.length} cards are in the right spot.`);
        }
    }

    return (
        <div className="space-y-4">
            <ol className="space-y-2">
                {order.map((item, pos) => (
                    <li
                        key={item}
                        draggable={!solved}
                        onDragStart={() => setDragFrom(pos)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                            if (dragFrom !== null) move(dragFrom, pos);
                            setDragFrom(null);
                        }}
                        onDragEnd={() => setDragFrom(null)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                            solved
                                ? "border-neon/40 bg-neon/5"
                                : dragFrom === pos
                                  ? "border-cyan bg-cyan/10 opacity-60"
                                  : "cursor-grab border-line bg-panel2 hover:border-cyan/60"
                        }`}
                    >
                        <span
                            className={`w-6 shrink-0 text-center font-mono text-sm ${solved ? "text-neon" : "text-dim"}`}
                        >
                            {solved ? "✔" : pos + 1}
                        </span>
                        <span className="flex-1 text-sm text-fg">
                            <Rich text={puzzle.items[item]} />
                        </span>
                        {!solved && (
                            <span className="flex shrink-0 flex-col">
                                <button
                                    aria-label="Move up"
                                    disabled={pos === 0}
                                    onClick={() => move(pos, pos - 1)}
                                    className="rounded px-2 text-dim hover:text-cyan disabled:opacity-20"
                                >
                                    ▲
                                </button>
                                <button
                                    aria-label="Move down"
                                    disabled={pos === order.length - 1}
                                    onClick={() => move(pos, pos + 1)}
                                    className="rounded px-2 text-dim hover:text-cyan disabled:opacity-20"
                                >
                                    ▼
                                </button>
                            </span>
                        )}
                    </li>
                ))}
            </ol>
            {msg && <Feedback tone="bad">{msg}</Feedback>}
            {!solved && (
                <div className="flex flex-wrap items-start gap-3">
                    <Button onClick={check}>Lock in order</Button>
                    <HintBar hints={puzzle.hints} onHint={onHint} />
                </div>
            )}
        </div>
    );
}

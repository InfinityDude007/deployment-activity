import { useState } from "react";
import type { FillBlankPuzzle, PuzzleProps } from "../types";
import { Button, Feedback, HintBar } from "./ui";

export function FillBlank({
    puzzle,
    solved,
    onWrong,
    onHint,
    onSolved,
}: PuzzleProps<FillBlankPuzzle>) {
    const ids = Object.keys(puzzle.blanks);
    const [vals, setVals] = useState<Record<string, string>>(() =>
        solved
            ? Object.fromEntries(
                  ids.map((id) => [id, puzzle.blanks[id].answer]),
              )
            : {},
    );
    const [wrong, setWrong] = useState<string[]>([]);
    const [msg, setMsg] = useState<string | null>(null);

    function check() {
        if (ids.some((id) => !vals[id])) {
            setMsg("Fill every blank first.");
            return;
        }
        const bad = ids.filter((id) => vals[id] !== puzzle.blanks[id].answer);
        setWrong(bad);
        if (!bad.length) {
            setMsg(null);
            onSolved();
        } else {
            onWrong();
            setMsg(
                `${bad.length} blank${bad.length > 1 ? "s are" : " is"} still wrong (highlighted in red).`,
            );
        }
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-line bg-ink">
                <div className="border-b border-line px-3 py-1.5 font-mono text-xs text-dim">
                    Dockerfile
                </div>
                <div className="overflow-x-auto p-3 font-mono text-[13px] leading-8">
                    {puzzle.code.map((line, li) => (
                        <div
                            key={li}
                            className="flex items-center whitespace-pre"
                        >
                            <span className="mr-3 w-5 shrink-0 select-none text-right text-dim/50">
                                {li + 1}
                            </span>
                            {line.split(/\[\[(\w+)\]\]/).map((part, pi) => {
                                if (pi % 2 === 0)
                                    return (
                                        <span
                                            key={pi}
                                            className={
                                                line.startsWith("#")
                                                    ? "text-dim"
                                                    : "text-fg"
                                            }
                                        >
                                            {part}
                                        </span>
                                    );
                                const b = puzzle.blanks[part];
                                const isWrong = wrong.includes(part);
                                return (
                                    <select
                                        key={pi}
                                        aria-label={`Blank ${part}`}
                                        disabled={solved}
                                        value={vals[part] ?? ""}
                                        onChange={(e) => {
                                            setVals((v) => ({
                                                ...v,
                                                [part]: e.target.value,
                                            }));
                                            setWrong((w) =>
                                                w.filter((x) => x !== part),
                                            );
                                        }}
                                        className={`mx-0.5 rounded border bg-panel2 px-1.5 py-0.5 font-mono font-semibold outline-none focus:border-cyan ${
                                            solved
                                                ? "border-neon/50 text-neon"
                                                : isWrong
                                                  ? "border-danger text-danger"
                                                  : vals[part]
                                                    ? "border-cyan/50 text-cyan"
                                                    : "border-amber/50 text-amber"
                                        }`}
                                    >
                                        <option value="" disabled>
                                            ____
                                        </option>
                                        {b.options.map((o) => (
                                            <option key={o} value={o}>
                                                {o}
                                            </option>
                                        ))}
                                    </select>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {msg && <Feedback tone="bad">{msg}</Feedback>}
            {!solved && (
                <div className="flex flex-wrap items-start gap-3">
                    <Button onClick={check}>Check recipe</Button>
                    <HintBar hints={puzzle.hints} onHint={onHint} />
                </div>
            )}
        </div>
    );
}

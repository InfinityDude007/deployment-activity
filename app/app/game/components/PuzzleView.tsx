import { useState } from "react";
import type { Puzzle, PuzzleProps, Room } from "../types";
import type { Attempt } from "../lib/scoring";
import { puzzleScore } from "../lib/scoring";
import { Terminal } from "./Terminal";
import { FillBlank } from "./FillBlank";
import { MultipleChoice } from "./MultipleChoice";
import { SpotTheBug } from "./SpotTheBug";
import { DragOrder } from "./DragOrder";
import { FieldManual } from "./Screens";
import { Button, CodeBlock, Eyebrow, Panel, Rich } from "./ui";

function PuzzleBody(props: PuzzleProps<Puzzle>) {
    const p = props.puzzle;
    switch (p.type) {
        case "terminal":
            return <Terminal {...props} puzzle={p} />;
        case "fillblank":
            return <FillBlank {...props} puzzle={p} />;
        case "mcq":
            return <MultipleChoice {...props} puzzle={p} />;
        case "spotbug":
            return <SpotTheBug {...props} puzzle={p} />;
        case "order":
            return <DragOrder {...props} puzzle={p} />;
    }
}

type Props = {
    room: Room;
    roomIndex: number;
    puzzleIndex: number;
    attempt: Attempt;
    earned: number | null;
    onWrong: (penalty?: number) => void;
    onHint: (cost: number) => void;
    onSolved: () => void;
    onNext: () => void;
};

export function PuzzleView({
    room,
    roomIndex,
    puzzleIndex,
    attempt,
    earned,
    onWrong,
    onHint,
    onSolved,
    onNext,
}: Props) {
    const puzzle = room.puzzles[puzzleIndex];
    const [manual, setManual] = useState(false);
    const solved = earned !== null;
    const worth = solved ? earned : puzzleScore(puzzle.points, attempt);
    const last = puzzleIndex === room.puzzles.length - 1;

    return (
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <Eyebrow>
                        Room {roomIndex + 1} · {room.name} · Puzzle{" "}
                        {puzzleIndex + 1}/{room.puzzles.length}
                    </Eyebrow>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                        {puzzle.title}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        className="min-h-8! px-3! py-1! text-xs"
                        onClick={() => setManual((m) => !m)}
                        aria-expanded={manual}
                    >
                        📖 Field manual
                    </Button>
                    <span
                        className="font-mono text-sm"
                        title="Points this puzzle is currently worth"
                    >
                        <span
                            className={
                                worth < puzzle.points
                                    ? "text-amber"
                                    : "text-neon"
                            }
                        >
                            {worth}
                        </span>
                        <span className="text-dim">/{puzzle.points}</span>
                    </span>
                </div>
            </div>

            {manual && (
                <Panel className="p-4! sm:p-5!">
                    <FieldManual room={room} />
                </Panel>
            )}

            <Panel>
                <p className="mb-5 text-fg/90">
                    <Rich text={puzzle.prompt} />
                </p>
                {puzzle.context && (
                    <div className="mb-5">
                        <CodeBlock
                            label={puzzle.context.label}
                            code={puzzle.context.code}
                        />
                    </div>
                )}
                <PuzzleBody
                    key={puzzle.id}
                    puzzle={puzzle}
                    solved={solved}
                    onWrong={onWrong}
                    onHint={onHint}
                    onSolved={onSolved}
                />
            </Panel>

            {solved && (
                <div className="pop-in rounded-xl border border-neon/50 bg-neon/10 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-lg font-bold text-neon">
                            ✔ Solved · +{earned} pts
                        </p>
                        <Button onClick={onNext} autoFocus>
                            {last ? "Clear the room →" : "Next puzzle →"}
                        </Button>
                    </div>
                    <p className="mt-3 text-sm text-fg/90">
                        <span className="mr-2 font-mono text-xs text-neon/80">
                            INTEL
                        </span>
                        <Rich text={puzzle.debrief} />
                    </p>
                </div>
            )}
        </div>
    );
}

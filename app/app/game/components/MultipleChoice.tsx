import { useMemo, useState } from "react";
import type { McqPuzzle, PuzzleProps } from "../types";
import { HintBar, Rich, seededShuffle } from "./ui";

export function MultipleChoice({ puzzle, solved, onWrong, onHint, onSolved }: PuzzleProps<McqPuzzle>) {
  const options = useMemo(() => seededShuffle(puzzle.options, puzzle.id), [puzzle]);
  const [ruledOut, setRuledOut] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(() => (solved ? puzzle.options.find((o) => o.correct)!.text : null));

  function choose(text: string, correct?: boolean) {
    if (picked || ruledOut.includes(text)) return;
    if (correct) {
      setPicked(text);
      onSolved();
    } else {
      setRuledOut((r) => [...r, text]);
      onWrong();
    }
  }

  return (
    <div className="space-y-3">
      {options.map((o, i) => {
        const out = ruledOut.includes(o.text);
        const win = picked === o.text;
        return (
          <button
            key={o.text}
            onClick={() => choose(o.text, o.correct)}
            disabled={Boolean(picked) || out}
            className={`group block w-full rounded-lg border px-4 py-3 text-left transition ${
              win
                ? "border-neon bg-neon/10"
                : out
                  ? "border-danger/40 bg-danger/5 opacity-80"
                  : picked
                    ? "border-line opacity-50"
                    : "border-line bg-panel2 hover:border-cyan hover:bg-cyan/5"
            }`}
          >
            <div className="flex gap-3">
              <span className={`font-mono text-sm ${win ? "text-neon" : out ? "text-danger" : "text-dim group-hover:text-cyan"}`}>
                {win ? "✔" : out ? "✘" : String.fromCharCode(65 + i)}
              </span>
              <span className={out ? "text-dim line-through decoration-danger/50" : "text-fg"}>
                <Rich text={o.text} />
              </span>
            </div>
            {(out || win) && (
              <p className={`mt-2 pl-7 text-sm ${win ? "text-neon" : "text-danger/90"}`}>
                <Rich text={o.why} />
              </p>
            )}
          </button>
        );
      })}
      {!picked && <HintBar hints={puzzle.hints} onHint={onHint} />}
    </div>
  );
}

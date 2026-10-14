import { useState } from "react";
import type { PuzzleProps, SpotBugPuzzle } from "../types";
import { Button, Feedback, HintBar, Rich } from "./ui";

export function SpotTheBug({ puzzle, solved, onWrong, onHint, onSolved }: PuzzleProps<SpotBugPuzzle>) {
  const bugLines = Object.keys(puzzle.bugs).map(Number);
  const [selected, setSelected] = useState<number[]>(() => (solved ? bugLines : []));
  const [msg, setMsg] = useState<string | null>(null);

  function toggle(i: number) {
    if (solved) return;
    setMsg(null);
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  }

  function submit() {
    const found = selected.filter((i) => bugLines.includes(i)).length;
    const falsePos = selected.length - found;
    if (found === bugLines.length && falsePos === 0) {
      onSolved();
      return;
    }
    onWrong();
    const parts = [`You've found ${found} of ${bugLines.length} sabotaged lines.`];
    if (falsePos) parts.push(`${falsePos} of your picks ${falsePos > 1 ? "are" : "is"} actually fine.`);
    setMsg(parts.join(" "));
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-line bg-ink">
        <div className="flex items-center justify-between border-b border-line px-3 py-1.5 font-mono text-xs text-dim">
          <span>{puzzle.file}</span>
          <span>
            {selected.length} selected · {bugLines.length} to find
          </span>
        </div>
        <div className="overflow-x-auto py-2 font-mono text-[13px] leading-6">
          {puzzle.code.map((line, i) => {
            const on = selected.includes(i);
            const blank = line.trim() === "";
            return (
              <div key={i}>
                <button
                  type="button"
                  disabled={blank || solved}
                  onClick={() => toggle(i)}
                  className={`flex w-full min-w-max whitespace-pre px-3 text-left transition ${
                    blank ? "cursor-default" : solved ? "" : "hover:bg-cyan/10"
                  } ${on ? (solved ? "bg-neon/10" : "bg-danger/15") : ""}`}
                >
                  <span className={`mr-3 w-6 shrink-0 select-none text-right ${on ? (solved ? "text-neon" : "text-danger") : "text-dim/50"}`}>
                    {on ? (solved ? "✔" : "✘") : i + 1}
                  </span>
                  <span className={on ? (solved ? "text-neon" : "text-danger") : "text-fg"}>{line || " "}</span>
                </button>
                {solved && puzzle.bugs[i] && (
                  <div className="mx-3 mb-1 ml-12 rounded border-l-2 border-neon bg-neon/5 px-3 py-1 font-sans text-xs text-neon">
                    <Rich text={puzzle.bugs[i]} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {msg && <Feedback tone="bad">{msg}</Feedback>}
      {!solved && (
        <div className="flex flex-wrap items-start gap-3">
          <Button onClick={submit} disabled={!selected.length}>
            Submit {selected.length} line{selected.length === 1 ? "" : "s"}
          </Button>
          <HintBar hints={puzzle.hints} onHint={onHint} />
        </div>
      )}
    </div>
  );
}

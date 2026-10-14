import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { PuzzleProps, TerminalPuzzle } from "../types";
import { normalize, test } from "../lib/terminal";
import { TERMINAL_WRONG_PENALTY } from "../lib/scoring";
import { HintBar, Rich } from "./ui";

type Line = { kind: "in" | "out" | "ok" | "err" | "sys"; text: string };

const COLORS: Record<Line["kind"], string> = {
  in: "text-white",
  out: "text-fg",
  ok: "text-neon",
  err: "text-danger",
  sys: "text-dim",
};

export function Terminal({ puzzle, solved, onWrong, onHint, onSolved }: PuzzleProps<TerminalPuzzle>) {
  const [step, setStep] = useState(solved ? puzzle.steps.length : 0);
  const [lines, setLines] = useState<Line[]>(() => (puzzle.intro ?? []).map((text) => ({ kind: "sys", text })));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = step >= puzzle.steps.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const raw = input;
    setInput("");
    setHIdx(null);
    if (!raw.trim()) return;
    setHistory((h) => [...h, raw]);
    const cmd = normalize(raw);
    const out: Line[] = [{ kind: "in", text: `${puzzle.prefix} ${raw}` }];

    if (cmd === "clear") {
      setLines([]);
      return;
    }
    if (cmd === "help") {
      out.push({ kind: "sys", text: done ? "All objectives complete. Hit Continue." : `Objective: ${puzzle.steps[step].objective}` });
    } else if (cmd === "ls") {
      out.push({ kind: "out", text: puzzle.files?.length ? puzzle.files.join("   ") : "(empty: no source code on this machine)" });
    } else if (done) {
      out.push({ kind: "sys", text: "Mission complete. Hit Continue below." });
    } else {
      const s = puzzle.steps[step];
      if (s.accept.some((m) => test(m, cmd))) {
        out.push(...s.output.map((text) => ({ kind: "ok" as const, text })));
        const next = step + 1;
        setStep(next);
        if (next >= puzzle.steps.length) onSolved();
      } else {
        const err = s.errors?.find((x) => test(x.when, cmd));
        const first = cmd.split(" ")[0];
        out.push({
          kind: "err",
          text:
            err?.msg ??
            (first === "docker"
              ? "Docker didn't understand that. Re-read the objective, open the 📖 Field manual, or grab a hint."
              : `zsh: command not found: ${first}  (commands here start with "docker")`),
        });
        onWrong(TERMINAL_WRONG_PENALTY);
      }
    }
    setLines((l) => [...l, ...out]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!history.length) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = hIdx === null ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown" && hIdx !== null) {
      e.preventDefault();
      const i = hIdx + 1;
      if (i >= history.length) {
        setHIdx(null);
        setInput("");
      } else {
        setHIdx(i);
        setInput(history[i]);
      }
    }
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {puzzle.steps.map((s, i) => (
          <li
            key={i}
            className={`flex gap-3 rounded-md border px-3 py-2 text-sm ${
              i < step ? "border-neon/30 bg-neon/5 text-dim" : i === step ? "border-cyan/40 bg-cyan/5 text-fg" : "border-line text-dim/60"
            }`}
          >
            <span className="font-mono">{i < step ? "✔" : i === step ? "▶" : "·"}</span>
            <span className={i < step ? "line-through decoration-neon/40" : ""}>
              {i <= step ? <Rich text={s.objective} /> : "Locked"}
            </span>
          </li>
        ))}
      </ol>

      <div
        className="overflow-hidden rounded-lg border border-line bg-[#05080b] shadow-[inset_0_0_40px_rgba(61,220,132,0.04)]"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-neon/70" />
          <span className="ml-2 truncate font-mono text-xs text-dim">{puzzle.prefix.replace(/\$$/, "")}</span>
        </div>
        <div ref={scrollRef} className="h-64 overflow-y-auto p-3 font-mono text-[13px] leading-relaxed sm:h-72">
          {lines.map((l, i) => (
            <div key={i} className={`whitespace-pre-wrap break-words ${COLORS[l.kind]}`}>
              {l.kind === "in" ? l.text : l.text.replace(/`/g, "")}
            </div>
          ))}
          <form onSubmit={submit} className="flex items-baseline gap-2">
            <label htmlFor={`term-${puzzle.id}`} className="shrink-0 text-neon">
              {puzzle.prefix}
            </label>
            <input
              id={`term-${puzzle.id}`}
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-white caret-neon outline-none"
              aria-label="Terminal command"
            />
          </form>
        </div>
      </div>

      {!done && <HintBar key={step} hints={puzzle.steps[step].hints} onHint={onHint} />}
    </div>
  );
}

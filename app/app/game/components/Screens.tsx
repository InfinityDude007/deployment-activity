import { useState, type FormEvent } from "react";
import type { Room } from "../types";
import { MASTER_CODE, ROOMS } from "../content";
import { COUNTDOWN_MS, HINT_COSTS, SPEED_BONUS_MAX, TERMINAL_WRONG_PENALTY, WRONG_PENALTY } from "../lib/scoring";
import { normalize } from "../lib/terminal";
import { Button, CodeBlock, Eyebrow, Feedback, Panel, Rich } from "./ui";
import { Logo } from "./Logo";

export function NameScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");
  const clean = name.trim().replace(/\s+/g, " ");
  return (
    <div className="mx-auto flex min-h-[85vh] max-w-xl flex-col justify-center px-4 py-10">
      <Logo className="mb-6 h-16 w-16" />
      <Eyebrow>GID Education Session · Bounty #0420</Eyebrow>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Operation <span className="text-neon">Midnight Deploy</span>
      </h1>
      <p className="mt-4 text-lg text-dim">A DevOps escape room. Fix the build, ship the container, rescue the portal.</p>
      <form
        className="mt-8 space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (clean) onStart(clean);
        }}
      >
        <label htmlFor="hunter-name" className="block font-mono text-xs uppercase tracking-widest text-dim">
          Bounty hunter name
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="hunter-name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder="Your real name, for the leaderboard"
            autoFocus
            className="min-h-11 flex-1 rounded-md border border-line bg-panel px-4 font-mono text-white outline-none placeholder:text-dim/60 focus:border-neon"
          />
          <Button type="submit" disabled={!clean}>
            Sign the contract →
          </Button>
        </div>
        <p className="text-xs text-dim">Only your first run counts on the leaderboard. No Docker or coding experience needed.</p>
      </form>
    </div>
  );
}

export function StoryScreen({ name, onAccept }: { name: string; onAccept: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Panel>
        <Eyebrow>Incoming transmission · 23:58</Eyebrow>
        <h2 className="mt-3 text-3xl font-bold text-white">Welcome, {name}.</h2>
        <div className="mt-5 space-y-4 text-fg/90">
          <p>
            <Rich text="The **AIESEC opportunities portal** crashed hours before the global recruitment drive. Thousands of applicants will hit it at sunrise." />
          </p>
          <p>
            <Rich text="The developer who built it has **vanished**. A saboteur has been through the repo. All that's left is broken code and a sticky note." />
          </p>
          <p>
            <Rich text="Your bounty: get the portal **containerised, shipped and deployed** through four locked rooms. Each one gives you a keycard fragment. Collect all four to open the final door." />
          </p>
        </div>
        <div className="mt-6 grid gap-2 rounded-lg border border-line bg-ink/60 p-4 text-sm sm:grid-cols-2">
          <Rule icon="⏱">
            <Rich text={`**${COUNTDOWN_MS / 60000}-minute** countdown. Finish faster for up to **+${SPEED_BONUS_MAX}** bonus.`} />
          </Rule>
          <Rule icon="🎯">Each puzzle is worth 100–200 pts.</Rule>
          <Rule icon="✘">
            Wrong answers cost {WRONG_PENALTY} pts ({TERMINAL_WRONG_PENALTY} in the terminal).
          </Rule>
          <Rule icon="💡">
            Hints cost {HINT_COSTS.join(" then ")} pts. The 📖 Field manual is free.
          </Rule>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button onClick={onAccept}>Accept the bounty · start the clock</Button>
          <span className="text-xs text-dim">Rooms: {ROOMS.map((r) => r.name).join(" → ")}</span>
        </div>
      </Panel>
    </div>
  );
}

function Rule({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-fg/90">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function FieldManual({ room }: { room: Room }) {
  const b = room.briefing;
  return (
    <div className="space-y-4">
      <p className="text-fg/90">
        <Rich text={b.lead} />
      </p>
      <dl className="grid gap-2 sm:grid-cols-2">
        {b.terms.map((t) => (
          <div key={t.term} className="rounded-lg border border-line bg-ink/60 p-3">
            <dt className="font-mono text-sm font-semibold text-cyan">
              <Rich text={t.term} />
            </dt>
            <dd className="mt-1 text-sm text-fg/85">
              <Rich text={t.def} />
            </dd>
          </div>
        ))}
      </dl>
      {b.cheats?.map((c) => <CodeBlock key={c.label} label={c.label} code={c.code} />)}
      {b.note && (
        <Feedback tone="info">
          <Rich text={b.note} />
        </Feedback>
      )}
    </div>
  );
}

export function Briefing({ room, index, onEnter }: { room: Room; index: number; onEnter: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Panel>
        <Eyebrow>
          Room {index + 1} of {ROOMS.length} · {room.topic}
        </Eyebrow>
        <h2 className="mt-2 text-3xl font-bold text-white">{room.name}</h2>
        <p className="mt-4 border-l-2 border-amber/60 pl-4 italic text-fg/85">
          <Rich text={room.story} />
        </p>
        <h3 className="mb-3 mt-7 font-mono text-xs uppercase tracking-widest text-dim">📖 Field manual (you can reopen this inside the room)</h3>
        <FieldManual room={room} />
        <div className="mt-7">
          <Button onClick={onEnter}>Enter {room.name} →</Button>
        </div>
      </Panel>
    </div>
  );
}

export function RoomCleared({ room, index, points, onNext }: { room: Room; index: number; points: number; onNext: () => void }) {
  const last = index === ROOMS.length - 1;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <Eyebrow>Room cleared</Eyebrow>
      <h2 className="mt-3 text-3xl font-bold text-white">{room.name} unlocked</h2>
      <p className="mt-2 text-dim">+{points} pts earned in this room</p>
      <div className="pop-in mt-8 rounded-xl border-2 border-neon bg-neon/10 px-10 py-6 shadow-[0_0_60px_-10px_var(--color-neon)]">
        <p className="font-mono text-xs uppercase tracking-widest text-neon/80">Keycard fragment {index + 1}/4</p>
        <p className="mt-1 font-mono text-5xl font-bold tracking-[0.3em] text-neon">{room.fragment}</p>
      </div>
      <Button className="mt-10" onClick={onNext}>
        {last ? "Approach the final door →" : `Next: ${ROOMS[index + 1].name} →`}
      </Button>
    </div>
  );
}

export function FinalDoor({ wrong, onWrong, onOpen }: { wrong: number; onWrong: () => void; onOpen: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <Eyebrow>The final door</Eyebrow>
      <h2 className="mt-3 text-3xl font-bold text-white">Enter the master code</h2>
      <p className="mt-2 text-dim">Put your four keycard fragments together, in order.</p>
      <div className="mt-6 flex gap-2">
        {ROOMS.map((r) => (
          <span key={r.id} className="rounded-md border border-neon/50 bg-neon/10 px-3 py-2 font-mono text-xl font-bold text-neon">
            {r.fragment}
          </span>
        ))}
      </div>
      <form
        className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (normalize(code).replace(/\s/g, "") === MASTER_CODE.toLowerCase()) onOpen();
          else {
            setErr(true);
            onWrong();
          }
        }}
      >
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setErr(false);
          }}
          aria-label="Master code"
          autoFocus
          autoComplete="off"
          className={`min-h-11 flex-1 rounded-md border bg-panel px-4 text-center font-mono text-lg uppercase tracking-[0.3em] text-white outline-none focus:border-neon ${err ? "border-danger" : "border-line"}`}
        />
        <Button type="submit">Unlock</Button>
      </form>
      {err && <p className="mt-3 text-sm text-danger">ACCESS DENIED{wrong > 1 ? ` ×${wrong}` : ""}. Read the fragments left to right.</p>}
    </div>
  );
}

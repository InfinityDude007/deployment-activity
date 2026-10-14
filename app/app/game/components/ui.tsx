import {
    Fragment,
    useState,
    type ButtonHTMLAttributes,
    type ReactNode,
} from "react";
import { HINT_COSTS } from "../lib/scoring";

type Variant = "primary" | "ghost" | "amber";

export function Button({
    variant = "primary",
    className = "",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
    const styles: Record<Variant, string> = {
        primary:
            "bg-neon text-ink hover:brightness-110 shadow-[0_0_24px_-6px_var(--color-neon)]",
        ghost: "border border-line text-fg hover:border-neon hover:text-neon",
        amber: "border border-amber/50 text-amber hover:bg-amber/10",
    };
    return (
        <button
            {...props}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 font-mono text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
        />
    );
}

export function Panel({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-xl border border-line bg-panel/90 p-5 backdrop-blur sm:p-7 ${className}`}
        >
            {children}
        </section>
    );
}

export function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon">
            {children}
        </p>
    );
}

/** Tiny markdown: `code` and **bold**, newlines preserved. */
export function Rich({ text }: { text: string }) {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return (
        <span className="whitespace-pre-line">
            {parts.map((p, i) =>
                p.length > 2 && p.startsWith("`") && p.endsWith("`") ? (
                    <code
                        key={i}
                        className="rounded bg-ink px-1.5 py-0.5 font-mono text-[0.88em] text-cyan"
                    >
                        {p.slice(1, -1)}
                    </code>
                ) : p.startsWith("**") && p.endsWith("**") ? (
                    <strong key={i} className="font-semibold text-white">
                        {p.slice(2, -2)}
                    </strong>
                ) : (
                    <Fragment key={i}>{p}</Fragment>
                ),
            )}
        </span>
    );
}

export function CodeBlock({ label, code }: { label?: string; code: string }) {
    return (
        <div className="overflow-hidden rounded-lg border border-line bg-ink">
            {label && (
                <div className="border-b border-line px-3 py-1.5 font-mono text-xs text-dim">
                    {label}
                </div>
            )}
            <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-fg">
                {code}
            </pre>
        </div>
    );
}

export function Feedback({
    tone,
    children,
}: {
    tone: "bad" | "good" | "info";
    children: ReactNode;
}) {
    const t = {
        bad: "border-danger/40 bg-danger/10 text-danger",
        good: "border-neon/40 bg-neon/10 text-neon",
        info: "border-cyan/30 bg-cyan/10 text-cyan",
    }[tone];
    return (
        <div
            role="status"
            className={`rounded-md border px-3 py-2 text-sm ${t}`}
        >
            {children}
        </div>
    );
}

/** Progressive hints; each reveal costs points. */
export function HintBar({
    hints,
    onHint,
    disabled,
}: {
    hints: string[];
    onHint: (cost: number) => void;
    disabled?: boolean;
}) {
    const [shown, setShown] = useState(0);
    if (!hints.length) return null;
    const next =
        shown < hints.length
            ? HINT_COSTS[Math.min(shown, HINT_COSTS.length - 1)]
            : null;
    return (
        <div className="space-y-2">
            {hints.slice(0, shown).map((h, i) => (
                <div
                    key={i}
                    className="rounded-md border border-amber/30 bg-amber/5 px-3 py-2 text-sm text-amber"
                >
                    <span className="mr-2 font-mono text-xs opacity-70">
                        HINT {i + 1}
                    </span>
                    <Rich text={h} />
                </div>
            ))}
            {next !== null && !disabled && (
                <Button
                    variant="amber"
                    className="min-h-8! px-3! py-1! text-xs"
                    onClick={() => {
                        onHint(next);
                        setShown((s) => s + 1);
                    }}
                >
                    💡 {shown === 0 ? "Need a hint?" : "Bigger hint"} (−{next}{" "}
                    pts)
                </Button>
            )}
        </div>
    );
}

/** Deterministic shuffle so options don't always put the answer first. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
        h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
        const j = h % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

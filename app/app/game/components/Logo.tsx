import { useId } from "react";

/** Container under a midnight moon, shipping upward. Same artwork as public/logo.svg. */
export function Logo({ className = "" }: { className?: string }) {
  const mask = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <mask id={mask}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="49" cy="14" r="8.5" fill="#000" />
        </mask>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#0b1219" stroke="#3ddc84" strokeWidth="3" />
      <circle cx="16" cy="14" r="1.6" fill="#d5e1ec" />
      <circle cx="27" cy="10" r="1.1" fill="#d5e1ec" opacity=".7" />
      <circle cx="24" cy="21" r="1" fill="#d5e1ec" opacity=".5" />
      <circle cx="43" cy="20" r="10" fill="#ffb547" mask={`url(#${mask})`} />
      <rect x="9" y="33" width="33" height="19" rx="3" fill="#3ddc84" />
      <path d="M16 37v11M22.5 37v11M29 37v11M35.5 37v11" stroke="#0b1219" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M52 51V36M47 41l5-5 5 5" fill="none" stroke="#5cc8ff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

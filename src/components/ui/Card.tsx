import { type ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card border border-hairline bg-white p-6 shadow-soft ${className}`}
    >
      {children}
    </section>
  );
}

const TILE_PASTELS = {
  blue: "bg-tile-blue",
  peach: "bg-tile-peach",
  lavender: "bg-tile-lavender",
} as const;

export function SummaryTile({
  label,
  value,
  hint,
  pastel = "blue",
}: {
  label: string;
  value: string;
  hint?: string;
  pastel?: keyof typeof TILE_PASTELS;
}) {
  return (
    <div
      className={`rounded-tile p-5 shadow-tile ${TILE_PASTELS[pastel]}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-secondary">
        {label}
      </p>
      <p className="mt-2 font-display text-xl font-semibold text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

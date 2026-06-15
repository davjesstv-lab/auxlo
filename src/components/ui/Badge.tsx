import { type ReactNode } from "react";

export type Tone = "low" | "review" | "elevated" | "neutral" | "indigo";

const TONES: Record<Tone, string> = {
  low: "bg-low-bg text-low",
  review: "bg-review-bg text-review",
  elevated: "bg-elevated-bg text-elevated",
  neutral: "bg-hairline text-ink-secondary",
  indigo: "bg-tile-lavender text-indigo-dark",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Tone for an operator jurisdiction value, matching the exposure palette. */
export function jurisdictionTone(
  jurisdiction: "CANADIAN" | "US_PARENT" | "FOREIGN",
): Tone {
  if (jurisdiction === "CANADIAN") return "low";
  if (jurisdiction === "US_PARENT") return "review";
  return "elevated";
}

/** Tone for a finding severity. */
export function severityTone(
  severity: "critical" | "high" | "medium" | "low",
): Tone {
  if (severity === "critical" || severity === "high") return "elevated";
  if (severity === "medium") return "review";
  return "neutral";
}

/** Tone for a sensitivity level. */
export function sensitivityTone(
  sensitivity: "ordinary" | "sensitive" | "health",
): Tone {
  if (sensitivity === "ordinary") return "neutral";
  if (sensitivity === "sensitive") return "review";
  return "elevated";
}

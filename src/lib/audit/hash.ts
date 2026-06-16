import "server-only";
import { createHash } from "node:crypto";

/** SHA-256 hex digest. */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Deterministic JSON serialization with recursively sorted object keys, so the
 * same logical content always produces the same string (and therefore the same
 * hash) regardless of key insertion order.
 */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortValue((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

/**
 * Computes the canonical hash for an audit log entry: sha256 over the entry's
 * content combined with the previous entry's hash. Both insertion and
 * verification call this, so they must pass identical fields.
 */
export function computeEntryHash(entry: {
  seq: number;
  organization_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  reviewer_id: string | null;
  actor_user_id: string | null;
  created_at: string;
  prev_hash: string;
}): string {
  return sha256Hex(canonicalize(entry));
}

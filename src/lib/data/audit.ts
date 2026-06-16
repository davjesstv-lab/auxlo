import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import { computeEntryHash } from "@/lib/audit/hash";
import type {
  AuditEntry,
  AuditEntryWithReviewer,
  AuditEventType,
} from "@/lib/domain/types";

/**
 * Appends an entry to the organization's hash chain. Reads the latest entry to
 * derive the previous hash and next sequence number, computes this entry's
 * hash over its canonical content + the previous hash, and inserts it. The
 * (organization_id, seq) unique constraint guards against concurrent inserts
 * claiming the same position.
 */
export async function appendAuditEntry(
  supabase: SupabaseClient,
  orgId: string,
  params: {
    eventType: AuditEventType;
    payload: Record<string, unknown>;
    reviewerId?: string | null;
    actorUserId?: string | null;
  },
): Promise<void> {
  const { data: last } = await supabase
    .from("audit_log_entries")
    .select("seq, entry_hash")
    .eq("organization_id", orgId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();

  const seq = (last?.seq ?? 0) + 1;
  const prevHash = last?.entry_hash ?? ""; // '' for the genesis entry
  const createdAt = new Date().toISOString();
  const reviewerId = params.reviewerId ?? null;
  const actorUserId = params.actorUserId ?? null;

  const entryHash = computeEntryHash({
    seq,
    organization_id: orgId,
    event_type: params.eventType,
    payload: params.payload,
    reviewer_id: reviewerId,
    actor_user_id: actorUserId,
    created_at: createdAt,
    prev_hash: prevHash,
  });

  const { error } = await supabase.from("audit_log_entries").insert({
    organization_id: orgId,
    seq,
    event_type: params.eventType,
    payload: params.payload,
    reviewer_id: reviewerId,
    actor_user_id: actorUserId,
    prev_hash: prevHash,
    entry_hash: entryHash,
    created_at: createdAt,
  });
  if (error) throw error;
}

/** Lists audit entries (oldest first) joined with reviewer details. */
export async function listAuditEntries(): Promise<AuditEntryWithReviewer[]> {
  if (!supabaseEnv.isConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log_entries")
    .select("*, reviewers(full_name, credential_type, credential_id)")
    .order("seq", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const reviewer = row.reviewers as
      | { full_name: string; credential_type: string; credential_id: string | null }
      | null;
    return {
      ...(row as AuditEntry),
      reviewer_name: reviewer?.full_name ?? null,
      reviewer_credential: reviewer
        ? `${reviewer.credential_type}${reviewer.credential_id ? ` · ${reviewer.credential_id}` : ""}`
        : null,
    };
  });
}

export type ChainVerification = {
  valid: boolean;
  count: number;
  brokenAtSeq: number | null;
};

/**
 * Walks the chain in order and confirms no entry was altered: each entry's
 * stored hash must equal the recomputed hash, and its prev_hash must equal the
 * preceding entry's entry_hash (the genesis entry's prev_hash is '').
 */
export function verifyChain(entries: AuditEntry[]): ChainVerification {
  let expectedPrev = "";
  for (const entry of entries) {
    const recomputed = computeEntryHash({
      seq: entry.seq,
      organization_id: entry.organization_id,
      event_type: entry.event_type,
      payload: entry.payload,
      reviewer_id: entry.reviewer_id,
      actor_user_id: entry.actor_user_id,
      created_at: entry.created_at,
      prev_hash: entry.prev_hash,
    });
    if (entry.prev_hash !== expectedPrev || recomputed !== entry.entry_hash) {
      return { valid: false, count: entries.length, brokenAtSeq: entry.seq };
    }
    expectedPrev = entry.entry_hash;
  }
  return { valid: true, count: entries.length, brokenAtSeq: null };
}

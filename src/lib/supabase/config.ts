/**
 * Supabase configuration for MapleGuard.
 *
 * Data residency is a core selling point: the Supabase project MUST be
 * provisioned in a Canadian region. We surface the configured region in the
 * UI so the user can see where their data lives. The default below documents
 * the expected region; the actual project region is set when the Supabase
 * project is created and is echoed here via NEXT_PUBLIC_SUPABASE_REGION.
 */
export const SUPABASE_REGION =
  process.env.NEXT_PUBLIC_SUPABASE_REGION ?? "ca-central-1";

export const supabaseEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  region: SUPABASE_REGION,
  /**
   * True only when both the project URL and anon key are present. Callers
   * must check this before instantiating a client so that builds and demos
   * without credentials degrade gracefully instead of throwing.
   */
  get isConfigured(): boolean {
    return Boolean(this.url && this.anonKey);
  },
};

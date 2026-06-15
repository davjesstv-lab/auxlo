import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";

/**
 * Resolves the authenticated user's organization for write operations.
 * Throws when Supabase is not configured or there is no signed-in user with an
 * organization — write paths are never available in demo mode.
 */
export async function requireOrg() {
  if (!supabaseEnv.isConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) {
    throw new Error("No organization associated with this user.");
  }
  return { supabase, orgId: profile.organization_id as string };
}

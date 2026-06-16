import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./config";

/**
 * Service-role Supabase client — bypasses RLS. Used ONLY for organization
 * administration (managing other users' roles), always behind an application
 * admin check. The key is server-only and never exposed to the browser.
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const adminConfigured = Boolean(supabaseEnv.url && serviceRoleKey);

export function getAdminClient() {
  if (!adminConfigured) {
    throw new Error("Service role key is not configured (SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(supabaseEnv.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

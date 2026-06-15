import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./config";

/**
 * Browser-side Supabase client for use in Client Components.
 */
export function createClient() {
  return createBrowserClient(supabaseEnv.url, supabaseEnv.anonKey);
}

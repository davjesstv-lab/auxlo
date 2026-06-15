import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import type { PrivacyOfficer } from "@/lib/domain/types";

/** Lists privacy officers for the current organization. In demo mode there
 * are none on file — which is exactly what triggers the accountability
 * finding, the most common gap in real Canadian SMB reviews. */
export async function listPrivacyOfficers(): Promise<PrivacyOfficer[]> {
  if (!supabaseEnv.isConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("privacy_officers")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PrivacyOfficer[];
}

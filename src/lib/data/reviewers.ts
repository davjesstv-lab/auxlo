import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import type { Reviewer } from "@/lib/domain/types";

/** Lists the organization's credentialed reviewers. */
export async function listReviewers(): Promise<Reviewer[]> {
  if (!supabaseEnv.isConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviewers")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reviewer[];
}

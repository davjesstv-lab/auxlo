import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import type { Artifact } from "@/lib/domain/types";

/** Lists all artifacts for the current organization (newest first). */
export async function listArtifacts(): Promise<Artifact[]> {
  if (!supabaseEnv.isConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Artifact[];
}

/** Fetches a single artifact by id. */
export async function getArtifact(id: string): Promise<Artifact | null> {
  if (!supabaseEnv.isConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Artifact) ?? null;
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import { DEMO_DATA_ASSETS } from "./demo";
import type { DataAsset } from "@/lib/domain/types";

/** Lists data assets for the current organization, or demo data when unconfigured. */
export async function listDataAssets(): Promise<DataAsset[]> {
  if (!supabaseEnv.isConfigured) return DEMO_DATA_ASSETS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("data_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DataAsset[];
}

/** Fetches a single data asset by id, or demo data when unconfigured. */
export async function getDataAsset(id: string): Promise<DataAsset | null> {
  if (!supabaseEnv.isConfigured) {
    return DEMO_DATA_ASSETS.find((a) => a.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("data_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as DataAsset) ?? null;
}

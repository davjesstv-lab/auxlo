import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import { DEMO_VENDORS } from "./demo";
import type { Vendor } from "@/lib/domain/types";

/** Lists vendors for the current organization, or demo data when unconfigured. */
export async function listVendors(): Promise<Vendor[]> {
  if (!supabaseEnv.isConfigured) return DEMO_VENDORS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Vendor[];
}

/** Fetches a single vendor by id, or demo data when unconfigured. */
export async function getVendor(id: string): Promise<Vendor | null> {
  if (!supabaseEnv.isConfigured) {
    return DEMO_VENDORS.find((v) => v.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Vendor) ?? null;
}

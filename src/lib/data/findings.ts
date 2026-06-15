import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import { evaluateFindings } from "@/lib/assessment/evaluate";
import { listVendors } from "./vendors";
import { listDataFlows } from "./dataFlows";
import { listPrivacyOfficers } from "./privacyOfficers";
import { listComplianceRules } from "./rules";
import type { ComplianceRule, FindingView } from "@/lib/domain/types";

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;

function sortBySeverity(findings: FindingView[]): FindingView[] {
  return [...findings].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
}

/**
 * Returns the findings for display. In demo mode they are evaluated live and
 * always indicative. When Supabase is configured they are read from the
 * persisted `findings` table (populated by the "run assessment" action), so
 * confirmed promotions survive.
 */
export async function listFindings(): Promise<FindingView[]> {
  if (!supabaseEnv.isConfigured) {
    const [vendors, flows, rules] = await Promise.all([
      listVendors(),
      listDataFlows(),
      listComplianceRules(),
    ]);
    const specs = evaluateFindings({
      privacyOfficerCount: 0,
      vendors,
      flows,
      rules,
    });
    const ruleById = new Map(rules.map((r) => [r.id, r]));
    return sortBySeverity(
      specs.map((s) => ({
        // URL-safe id for demo routing (dedup keys contain colons).
        id: s.dedupKey.replaceAll(":", "__"),
        condition: s.condition,
        severity: s.severity,
        status: "indicative" as const,
        target_type: s.targetType,
        target_label: s.targetLabel,
        recommended_artifact: s.recommendedArtifact,
        dedup_key: s.dedupKey,
        rule: s.ruleId ? (ruleById.get(s.ruleId) ?? null) : null,
      })),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("findings")
    .select("*, compliance_rules(*)");
  if (error) throw error;
  return sortBySeverity((data ?? []).map(toFindingView));
}

/** Fetches a single finding for the detail view. */
export async function getFinding(id: string): Promise<FindingView | null> {
  if (!supabaseEnv.isConfigured) {
    const all = await listFindings();
    return all.find((f) => f.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("findings")
    .select("*, compliance_rules(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toFindingView(data) : null;
}

type FindingRow = {
  id: string;
  condition: FindingView["condition"];
  severity: FindingView["severity"];
  status: FindingView["status"];
  target_type: FindingView["target_type"];
  target_label: string | null;
  recommended_artifact: string | null;
  dedup_key: string;
  compliance_rules: ComplianceRule | null;
};

function toFindingView(row: FindingRow): FindingView {
  return {
    id: row.id,
    condition: row.condition,
    severity: row.severity,
    status: row.status,
    target_type: row.target_type,
    target_label: row.target_label,
    recommended_artifact: row.recommended_artifact,
    dedup_key: row.dedup_key,
    rule: row.compliance_rules,
  };
}

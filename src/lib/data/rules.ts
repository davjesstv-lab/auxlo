import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import type { ComplianceCondition, ComplianceRule } from "@/lib/domain/types";

/** Subset of the seeded compliance_rules, mirrored for demo mode so findings
 * can cite real articles without a database. Ids match the seed intent. */
export const DEMO_RULES: ComplianceRule[] = [
  {
    id: "rule-law25-3-3",
    framework: "LAW25",
    reference: "Law 25, art. 3.3",
    obligation_en:
      "The title and contact information of the Privacy Officer must be published and recorded.",
    obligation_fr:
      "Le titre et les coordonnées du responsable de la protection des renseignements personnels doivent être publiés et consignés.",
    condition: "PRIVACY_OFFICER_NAMED",
    default_severity: "high",
    recommended_artifact: "privacy_officer_record",
  },
  {
    id: "rule-law25-17",
    framework: "LAW25",
    reference: "Law 25, art. 17",
    obligation_en:
      "Before communicating personal information outside Québec, a privacy impact assessment of the transfer must be conducted.",
    obligation_fr:
      "Avant de communiquer des renseignements personnels à l'extérieur du Québec, une évaluation des facteurs relatifs à la vie privée du transfert doit être réalisée.",
    condition: "CROSS_BORDER_TRANSFER",
    default_severity: "high",
    recommended_artifact: "foreign_transfer_adequacy",
  },
  {
    id: "rule-law25-18-3",
    framework: "LAW25",
    reference: "Law 25, art. 18.3",
    obligation_en:
      "Personal information communicated to a service provider must be governed by a written contract with safeguards; documented due diligence is expected.",
    obligation_fr:
      "Les renseignements personnels communiqués à un prestataire de services doivent être encadrés par un contrat écrit prévoyant des mesures de protection; une diligence raisonnable documentée est attendue.",
    condition: "VENDOR_DUE_DILIGENCE",
    default_severity: "medium",
    recommended_artifact: "vendor_due_diligence",
  },
];

/** Lists compliance rules, or the demo subset when Supabase is unconfigured. */
export async function listComplianceRules(): Promise<ComplianceRule[]> {
  if (!supabaseEnv.isConfigured) return DEMO_RULES;
  const supabase = await createClient();
  const { data, error } = await supabase.from("compliance_rules").select("*");
  if (error) throw error;
  return (data ?? []) as ComplianceRule[];
}

/** Picks the most relevant rule for a condition, preferring Law 25. */
export function pickRuleForCondition(
  rules: ComplianceRule[],
  condition: ComplianceCondition,
): ComplianceRule | null {
  const matches = rules.filter((r) => r.condition === condition);
  return matches.find((r) => r.framework === "LAW25") ?? matches[0] ?? null;
}

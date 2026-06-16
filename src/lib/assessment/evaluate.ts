import { pickRuleForCondition } from "@/lib/data/rules";
import { isCrossBorder } from "@/lib/exposure/engine";
import type {
  ComplianceRule,
  DataFlowWithRelations,
  FindingTarget,
  RuleSeverity,
  Vendor,
} from "@/lib/domain/types";

/** A single indicative finding produced by the assessment engine. */
export type FindingSpec = {
  dedupKey: string;
  condition: ComplianceRule["condition"];
  severity: RuleSeverity;
  targetType: FindingTarget;
  targetId: string | null;
  targetLabel: string | null;
  recommendedArtifact: string | null;
  ruleId: string | null;
};

export type AssessmentInput = {
  privacyOfficerCount: number;
  vendors: Vendor[];
  flows: DataFlowWithRelations[];
  rules: ComplianceRule[];
};

/**
 * Runs the in-scope obligations against the organization's data and produces
 * indicative findings. Prioritises the two most common gaps in real Canadian
 * SMB reviews — missing privacy officer and undocumented vendor due diligence —
 * plus unrecognised cross-border transfer exposure from the engine.
 *
 * Pure and deterministic: the same input always yields the same findings, with
 * stable dedup keys so persistence can upsert rather than duplicate.
 */
export function evaluateFindings(input: AssessmentInput): FindingSpec[] {
  const { privacyOfficerCount, vendors, flows, rules } = input;
  const findings: FindingSpec[] = [];

  // 1. Accountability: no named, recorded privacy officer (Law 25 art. 3.1-3.3).
  if (privacyOfficerCount === 0) {
    const rule = pickRuleForCondition(rules, "PRIVACY_OFFICER_NAMED");
    findings.push({
      dedupKey: "PRIVACY_OFFICER_NAMED",
      condition: "PRIVACY_OFFICER_NAMED",
      severity: rule?.default_severity ?? "high",
      targetType: "organization",
      targetId: null,
      targetLabel: null,
      recommendedArtifact: rule?.recommended_artifact ?? "privacy_officer_record",
      ruleId: rule?.id ?? null,
    });
  }

  // 2. Safeguards / vendor due diligence: vendors with no assessment on file.
  for (const vendor of vendors) {
    if (!vendor.due_diligence_completed) {
      const rule = pickRuleForCondition(rules, "VENDOR_DUE_DILIGENCE");
      findings.push({
        dedupKey: `VENDOR_DUE_DILIGENCE:${vendor.id}`,
        condition: "VENDOR_DUE_DILIGENCE",
        severity: rule?.default_severity ?? "medium",
        targetType: "vendor",
        targetId: vendor.id,
        targetLabel: vendor.name,
        recommendedArtifact: rule?.recommended_artifact ?? "vendor_due_diligence",
        ruleId: rule?.id ?? null,
      });
    }
  }

  // 3. Unrecognised cross-border transfer exposure (Law 25 art. 17).
  for (const flow of flows) {
    if (isCrossBorder(flow.exposure_level)) {
      const rule = pickRuleForCondition(rules, "CROSS_BORDER_TRANSFER");
      findings.push({
        dedupKey: `CROSS_BORDER_TRANSFER:${flow.id}`,
        condition: "CROSS_BORDER_TRANSFER",
        // Elevated exposure raises the finding severity.
        severity:
          flow.exposure_level === "ELEVATED"
            ? "critical"
            : (rule?.default_severity ?? "high"),
        targetType: "data_flow",
        targetId: flow.id,
        targetLabel: `${flow.data_asset_name} → ${flow.vendor_name}`,
        recommendedArtifact:
          rule?.recommended_artifact ?? "foreign_transfer_adequacy",
        ruleId: rule?.id ?? null,
      });
    }
  }

  return findings;
}

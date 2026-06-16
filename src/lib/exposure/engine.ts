import type {
  DataResidency,
  ExposureLevel,
  OperatorJurisdiction,
} from "@/lib/domain/types";

/** Axis 1 (vertical): where the data physically sits. */
export const RESIDENCY_AXIS: DataResidency[] = [
  "CANADA",
  "UNITED_STATES",
  "OTHER",
];

/** Axis 2 (horizontal): whose legal system can compel the operator. */
export const JURISDICTION_AXIS: OperatorJurisdiction[] = [
  "CANADIAN",
  "US_PARENT",
  "FOREIGN",
];

export type ExposureResult = {
  level: ExposureLevel;
  /** i18n key under `exposure.reasons` explaining the classification. */
  reason: string;
};

/**
 * The cross-border exposure engine — the differentiated core of MapleGuard.
 *
 * It answers two SEPARATE questions and combines them:
 *   - Axis 1, physical data residency: where the data actually sits.
 *   - Axis 2, operator jurisdiction: whose legal system can compel disclosure,
 *     driven by the operator's corporate parent domicile, NOT hosting location.
 *
 * Levels:
 *   - LOW  (green): data in Canada AND a Canadian-controlled operator.
 *   - REVIEW (amber): a jurisdictional mismatch that requires assessment.
 *   - ELEVATED (red): data physically outside Canada with a foreign operator.
 */
export function computeExposure(
  residency: DataResidency,
  jurisdiction: OperatorJurisdiction,
): ExposureResult {
  // ---------------------------------------------------------------------
  // HARDCODED CLOUD ACT MISMATCH RULE (flagship case — do not weaken):
  // Data hosted in a Canadian region but operated by a US-parent (or otherwise
  // foreign-controlled) entity is reachable under the US CLOUD Act regardless
  // of where it is physically hosted. This MUST be Review or higher, NEVER Low.
  // ---------------------------------------------------------------------
  if (residency === "CANADA" && jurisdiction !== "CANADIAN") {
    return {
      level: "REVIEW",
      reason:
        jurisdiction === "US_PARENT"
          ? "cloud_act_mismatch"
          : "foreign_operator_mismatch",
    };
  }

  // Low: data in Canada and a Canadian-controlled operator.
  if (residency === "CANADA" && jurisdiction === "CANADIAN") {
    return { level: "LOW", reason: "canadian_controlled" };
  }

  // Data physically outside Canada with a Canadian operator: the data has left
  // the country, so the transfer still needs to be assessed (Review).
  if (jurisdiction === "CANADIAN") {
    return { level: "REVIEW", reason: "data_abroad_canadian_operator" };
  }

  // Data physically in the US or other foreign jurisdiction with a foreign /
  // US-parent operator: Elevated.
  return { level: "ELEVATED", reason: "foreign_residency_and_operator" };
}

/** Maps an exposure level to a Badge tone. */
export function exposureTone(
  level: ExposureLevel,
): "low" | "review" | "elevated" {
  if (level === "LOW") return "low";
  if (level === "REVIEW") return "review";
  return "elevated";
}

/** Whether an exposure level represents cross-border exposure to flag. */
export function isCrossBorder(level: ExposureLevel): boolean {
  return level !== "LOW";
}

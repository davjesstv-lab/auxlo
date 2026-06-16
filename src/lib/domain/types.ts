export type DataResidency = "CANADA" | "UNITED_STATES" | "OTHER";

export type OperatorJurisdiction = "CANADIAN" | "US_PARENT" | "FOREIGN";

export type SensitivityLevel = "ordinary" | "sensitive" | "health";

export type ExposureLevel = "LOW" | "REVIEW" | "ELEVATED";

export type Framework = "LAW25" | "PIPEDA" | "PHIPA";

export type UserRole = "admin" | "practitioner" | "client";

export type HeadcountBand = "1-19" | "20-49" | "50-99" | "100-200" | "200+";

export type Jurisdiction =
  | "QC" | "ON" | "BC" | "AB" | "MB" | "SK" | "NS"
  | "NB" | "NL" | "PE" | "NT" | "NU" | "YT" | "OTHER";

export type Organization = {
  id: string;
  name: string;
  sector: string | null;
  headcount_band: HeadcountBand | null;
  primary_jurisdiction: Jurisdiction;
  preferred_language: "en" | "fr";
  created_at: string;
};

export type RuleSeverity = "low" | "medium" | "high" | "critical";

export type ComplianceCondition =
  | "PRIVACY_OFFICER_NAMED"
  | "VENDOR_DUE_DILIGENCE"
  | "CROSS_BORDER_TRANSFER"
  | "BREACH_RESPONSE"
  | "SAFEGUARDS"
  | "DATA_INVENTORY";

export type DataAsset = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  sensitivity: SensitivityLevel;
  data_subjects: string | null;
  purpose: string | null;
  retention: string | null;
  created_at: string;
};

export type Vendor = {
  id: string;
  organization_id: string;
  name: string;
  role: string | null;
  physical_hosting_region: DataResidency;
  operator_parent_domicile: string;
  operator_jurisdiction: OperatorJurisdiction;
  due_diligence_completed: boolean;
  notes: string | null;
  created_at: string;
};

export type DataFlow = {
  id: string;
  organization_id: string;
  data_asset_id: string;
  vendor_id: string;
  purpose: string | null;
  exposure_level: ExposureLevel;
  created_at: string;
};

/** A data flow joined with the names it links, for display. */
export type DataFlowWithRelations = DataFlow & {
  data_asset_name: string;
  vendor_name: string;
  physical_hosting_region: DataResidency;
  operator_jurisdiction: OperatorJurisdiction;
};

export type ComplianceRule = {
  id: string;
  framework: Framework;
  reference: string;
  obligation_en: string;
  obligation_fr: string;
  condition: ComplianceCondition;
  default_severity: RuleSeverity;
  recommended_artifact: string | null;
};

export type Reviewer = {
  id: string;
  organization_id: string;
  full_name: string;
  credential_type: string;
  credential_id: string | null;
  created_at: string;
};

export type AuditEventType =
  | "finding_confirmed"
  | "artifact_approved"
  | "reviewer_added";

export type AuditEntry = {
  id: string;
  organization_id: string;
  seq: number;
  event_type: AuditEventType;
  payload: Record<string, unknown>;
  reviewer_id: string | null;
  actor_user_id: string | null;
  prev_hash: string;
  entry_hash: string;
  created_at: string;
};

/** Audit entry joined with its reviewer, for the read-only timeline. */
export type AuditEntryWithReviewer = AuditEntry & {
  reviewer_name: string | null;
  reviewer_credential: string | null;
};

export type ArtifactType =
  | "privacy_impact_assessment"
  | "data_inventory"
  | "vendor_due_diligence"
  | "foreign_transfer_adequacy"
  | "breach_response_runbook"
  | "privacy_officer_record";

export type ArtifactReviewStatus = "draft" | "approved";

export type Artifact = {
  id: string;
  organization_id: string;
  type: ArtifactType;
  language: "en" | "fr";
  title: string;
  content: string;
  review_status: ArtifactReviewStatus;
  version: number;
  created_at: string;
};

export type FindingStatus = "indicative" | "confirmed";

export type FindingTarget =
  | "organization"
  | "vendor"
  | "data_flow"
  | "data_asset";

export type PrivacyOfficer = {
  id: string;
  organization_id: string;
  full_name: string;
  title: string | null;
  email: string | null;
  created_at: string;
};

/** A finding shaped for display: the persisted/derived finding plus its
 * citing rule, ready for the risk register and detail views. */
export type FindingView = {
  id: string;
  condition: ComplianceCondition;
  severity: RuleSeverity;
  status: FindingStatus;
  target_type: FindingTarget;
  target_label: string | null;
  recommended_artifact: string | null;
  dedup_key: string;
  rule: ComplianceRule | null;
};

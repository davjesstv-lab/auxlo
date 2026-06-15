export type DataResidency = "CANADA" | "UNITED_STATES" | "OTHER";

export type OperatorJurisdiction = "CANADIAN" | "US_PARENT" | "FOREIGN";

export type SensitivityLevel = "ordinary" | "sensitive" | "health";

export type Framework = "LAW25" | "PIPEDA" | "PHIPA";

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

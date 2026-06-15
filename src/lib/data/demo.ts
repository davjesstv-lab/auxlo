import type { DataAsset, Vendor } from "@/lib/domain/types";

/**
 * Read-only sample data shown in demo mode (when Supabase is not configured),
 * so the inventory and vendor views remain previewable. The vendors include
 * the flagship sovereignty case: data hosted in Canada but operated by a
 * US-parent entity.
 */
export const DEMO_VENDORS: Vendor[] = [
  {
    id: "demo-vendor-1",
    organization_id: "demo",
    name: "Northern Cloud Co.",
    role: "Hosting provider",
    physical_hosting_region: "CANADA",
    operator_parent_domicile: "CA",
    operator_jurisdiction: "CANADIAN",
    due_diligence_completed: true,
    notes: null,
    created_at: new Date("2026-01-15").toISOString(),
  },
  {
    id: "demo-vendor-2",
    organization_id: "demo",
    name: "Acme SaaS (ca-central-1)",
    role: "CRM processor",
    physical_hosting_region: "CANADA",
    operator_parent_domicile: "US",
    operator_jurisdiction: "US_PARENT",
    due_diligence_completed: false,
    notes: "Hosts in Canada, but parent is US-domiciled (CLOUD Act exposure).",
    created_at: new Date("2026-02-02").toISOString(),
  },
  {
    id: "demo-vendor-3",
    organization_id: "demo",
    name: "EuroAnalytics",
    role: "Analytics",
    physical_hosting_region: "OTHER",
    operator_parent_domicile: "FR",
    operator_jurisdiction: "FOREIGN",
    due_diligence_completed: false,
    notes: null,
    created_at: new Date("2026-03-10").toISOString(),
  },
];

export const DEMO_DATA_ASSETS: DataAsset[] = [
  {
    id: "demo-asset-1",
    organization_id: "demo",
    name: "Employee HR records",
    description: "Payroll, benefits, and contact details for staff.",
    sensitivity: "sensitive",
    data_subjects: "Employees",
    purpose: "Employment administration",
    retention: "7 years after end of employment",
    created_at: new Date("2026-01-20").toISOString(),
  },
  {
    id: "demo-asset-2",
    organization_id: "demo",
    name: "Customer accounts",
    description: "Names, emails, and billing information for customers.",
    sensitivity: "ordinary",
    data_subjects: "Customers",
    purpose: "Service delivery and billing",
    retention: "Duration of relationship + 3 years",
    created_at: new Date("2026-02-12").toISOString(),
  },
];

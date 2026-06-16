import type { OperatorJurisdiction } from "./types";

/**
 * Derive the operator jurisdiction (exposure Axis 2) from the operator's
 * corporate parent domicile.
 *
 * IMPORTANT: this is driven by *who can legally compel disclosure*, which is a
 * function of the operator's parent domicile — NOT where the data is hosted. A
 * US-parent operator hosting in Canada is still reachable under the US CLOUD
 * Act, so it must map to US_PARENT. The exposure engine (Phase 3) relies on
 * this distinction.
 */
export function deriveOperatorJurisdiction(
  parentDomicile: string,
): OperatorJurisdiction {
  const country = parentDomicile.trim().toUpperCase();
  if (country === "CA" || country === "CAN" || country === "CANADA") {
    return "CANADIAN";
  }
  if (country === "US" || country === "USA" || country === "UNITED STATES") {
    return "US_PARENT";
  }
  return "FOREIGN";
}

/** Common parent-domicile choices offered in the vendor form. */
export const PARENT_DOMICILE_OPTIONS = [
  "CA",
  "US",
  "GB",
  "FR",
  "DE",
  "IE",
  "AU",
  "OTHER",
] as const;

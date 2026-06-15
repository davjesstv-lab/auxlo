"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge, jurisdictionTone } from "@/components/ui/Badge";
import { Link } from "@/i18n/navigation";
import { saveVendor } from "@/app/[locale]/vendors/actions";
import { deriveOperatorJurisdiction, PARENT_DOMICILE_OPTIONS } from "@/lib/domain/vendor";
import type { DataResidency, Vendor } from "@/lib/domain/types";

const RESIDENCY_VALUES: DataResidency[] = ["CANADA", "UNITED_STATES", "OTHER"];

const fieldClass =
  "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";
const labelClass = "block text-sm font-medium text-ink-secondary";

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const t = useTranslations("vendors");
  const tEnum = useTranslations("enums");
  const tActions = useTranslations("actions");
  const locale = useLocale();

  const [parentDomicile, setParentDomicile] = useState(
    vendor?.operator_parent_domicile ?? "CA",
  );
  const derived = deriveOperatorJurisdiction(parentDomicile);

  return (
    <form action={saveVendor} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {vendor && <input type="hidden" name="id" value={vendor.id} />}

      <label className={labelClass}>
        {t("fields.name")}
        <input
          name="name"
          required
          defaultValue={vendor?.name ?? ""}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        {t("fields.role")}
        <input
          name="role"
          defaultValue={vendor?.role ?? ""}
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          {t("fields.hostingRegion")}
          <select
            name="physical_hosting_region"
            defaultValue={vendor?.physical_hosting_region ?? "CANADA"}
            className={fieldClass}
          >
            {RESIDENCY_VALUES.map((r) => (
              <option key={r} value={r}>
                {tEnum(`residency.${r}`)}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {t("fields.parentDomicile")}
          <select
            name="operator_parent_domicile"
            value={parentDomicile}
            onChange={(e) => setParentDomicile(e.target.value)}
            className={fieldClass}
          >
            {PARENT_DOMICILE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Live preview of the derived operator jurisdiction (Axis 2). */}
      <div className="rounded-tile bg-hairline/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-secondary">
            {t("fields.jurisdiction")}
          </span>
          <Badge tone={jurisdictionTone(derived)} dot>
            {tEnum(`jurisdiction.${derived}`)}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted">{t("jurisdictionHint")}</p>
        {derived === "US_PARENT" && (
          <p className="mt-1 text-xs text-review">{t("cloudActHint")}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          name="due_diligence_completed"
          defaultChecked={vendor?.due_diligence_completed ?? false}
          className="h-4 w-4 rounded border-hairline"
        />
        {t("fields.dueDiligence")}
      </label>

      <label className={labelClass}>
        {t("fields.notes")}
        <textarea
          name="notes"
          rows={3}
          defaultValue={vendor?.notes ?? ""}
          className={fieldClass}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
        >
          {tActions("save")}
        </button>
        <Link
          href="/vendors"
          className="rounded-tile px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-hairline/60"
        >
          {tActions("cancel")}
        </Link>
      </div>
    </form>
  );
}

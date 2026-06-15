"use client";

import { useLocale, useTranslations } from "next-intl";
import { saveDataFlow } from "@/app/[locale]/residency/actions";
import type { DataAsset, Vendor } from "@/lib/domain/types";

const fieldClass =
  "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";
const labelClass = "block text-sm font-medium text-ink-secondary";

export function DataFlowForm({
  assets,
  vendors,
}: {
  assets: DataAsset[];
  vendors: Vendor[];
}) {
  const t = useTranslations("residency");
  const locale = useLocale();

  if (assets.length === 0 || vendors.length === 0) {
    return <p className="text-sm text-muted">{t("noVendors")}</p>;
  }

  return (
    <form
      action={saveDataFlow}
      className="grid grid-cols-1 items-end gap-4 sm:grid-cols-4"
    >
      <input type="hidden" name="locale" value={locale} />
      <label className={`${labelClass} sm:col-span-1`}>
        {t("fields.asset")}
        <select name="data_asset_id" required className={fieldClass}>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} sm:col-span-1`}>
        {t("fields.vendor")}
        <select name="vendor_id" required className={fieldClass}>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} sm:col-span-1`}>
        {t("fields.purpose")}
        <input name="purpose" className={fieldClass} />
      </label>
      <button
        type="submit"
        className="rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
      >
        {t("addFlow")}
      </button>
    </form>
  );
}

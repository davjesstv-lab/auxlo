"use client";

import { useLocale, useTranslations } from "next-intl";
import { updateOrganization } from "@/app/[locale]/settings/actions";
import type {
  HeadcountBand,
  Jurisdiction,
  Organization,
} from "@/lib/domain/types";

const HEADCOUNTS: HeadcountBand[] = ["1-19", "20-49", "50-99", "100-200", "200+"];
const JURISDICTIONS: Jurisdiction[] = [
  "QC", "ON", "BC", "AB", "MB", "SK", "NS",
  "NB", "NL", "PE", "NT", "NU", "YT", "OTHER",
];

const fieldClass =
  "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";
const labelClass = "block text-sm font-medium text-ink-secondary";

export function OrgSettingsForm({ org }: { org: Organization }) {
  const t = useTranslations("settings");
  const locale = useLocale();

  return (
    <form action={updateOrganization} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />

      <label className={labelClass}>
        {t("fields.name")}
        <input name="name" required defaultValue={org.name} className={fieldClass} />
      </label>

      <label className={labelClass}>
        {t("fields.sector")}
        <input name="sector" defaultValue={org.sector ?? ""} className={fieldClass} />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <label className={labelClass}>
          {t("fields.headcount")}
          <select
            name="headcount_band"
            defaultValue={org.headcount_band ?? ""}
            className={fieldClass}
          >
            <option value="">—</option>
            {HEADCOUNTS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {t("fields.jurisdiction")}
          <select
            name="primary_jurisdiction"
            defaultValue={org.primary_jurisdiction}
            className={fieldClass}
          >
            {JURISDICTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {t("fields.language")}
          <select
            name="preferred_language"
            defaultValue={org.preferred_language}
            className={fieldClass}
          >
            <option value="fr">{t("languageFr")}</option>
            <option value="en">{t("languageEn")}</option>
          </select>
        </label>
      </div>

      <div>
        <button
          type="submit"
          className="rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
        >
          {t("save")}
        </button>
      </div>
    </form>
  );
}

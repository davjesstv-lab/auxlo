"use client";

import { useLocale, useTranslations } from "next-intl";
import { runAssessment, addPrivacyOfficer } from "@/app/[locale]/risk/actions";

const fieldClass =
  "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";
const labelClass = "block text-sm font-medium text-ink-secondary";

export function RunAssessmentButton() {
  const t = useTranslations("findings");
  const locale = useLocale();
  return (
    <form action={runAssessment}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="shrink-0 rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
      >
        {t("runAssessment")}
      </button>
    </form>
  );
}

export function PrivacyOfficerForm() {
  const t = useTranslations("findings");
  const locale = useLocale();
  return (
    <form
      action={addPrivacyOfficer}
      className="grid grid-cols-1 items-end gap-4 sm:grid-cols-4"
    >
      <input type="hidden" name="locale" value={locale} />
      <label className={labelClass}>
        {t("officerFields.name")}
        <input name="full_name" required className={fieldClass} />
      </label>
      <label className={labelClass}>
        {t("officerFields.title")}
        <input name="title" className={fieldClass} />
      </label>
      <label className={labelClass}>
        {t("officerFields.email")}
        <input name="email" type="email" className={fieldClass} />
      </label>
      <button
        type="submit"
        className="rounded-tile bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-secondary"
      >
        {t("officerSave")}
      </button>
    </form>
  );
}

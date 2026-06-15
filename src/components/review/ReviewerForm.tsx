"use client";

import { useLocale, useTranslations } from "next-intl";
import { addReviewer } from "@/app/[locale]/audit-prep/actions";

const fieldClass =
  "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";
const labelClass = "block text-sm font-medium text-ink-secondary";

export function ReviewerForm() {
  const t = useTranslations("audit");
  const locale = useLocale();
  return (
    <form
      action={addReviewer}
      className="grid grid-cols-1 items-end gap-4 sm:grid-cols-4"
    >
      <input type="hidden" name="locale" value={locale} />
      <label className={labelClass}>
        {t("reviewerFields.name")}
        <input name="full_name" required className={fieldClass} />
      </label>
      <label className={labelClass}>
        {t("reviewerFields.credentialType")}
        <input name="credential_type" required className={fieldClass} />
      </label>
      <label className={labelClass}>
        {t("reviewerFields.credentialId")}
        <input name="credential_id" className={fieldClass} />
      </label>
      <button
        type="submit"
        className="rounded-tile bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-secondary"
      >
        {t("addReviewer")}
      </button>
    </form>
  );
}

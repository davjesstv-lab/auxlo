"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type ReviewerOption = { id: string; full_name: string; credential_type: string };

/**
 * Reviewer selector + submit, used to promote a finding or approve an
 * artifact. The server action is passed in so this works for both targets.
 */
export function PromotionForm({
  action,
  targetId,
  reviewers,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  targetId: string;
  reviewers: ReviewerOption[];
  submitLabel: string;
}) {
  const t = useTranslations("promote");
  const locale = useLocale();

  if (reviewers.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        {t("needsReviewer")}{" "}
        <Link href="/audit-prep" className="text-indigo hover:underline">
          →
        </Link>
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={targetId} />
      <label className="block text-sm font-medium text-ink-secondary">
        {t("reviewer")}
        <select
          name="reviewer_id"
          required
          className="mt-1 block rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo"
        >
          {reviewers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.full_name} ({r.credential_type})
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-tile bg-low px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}

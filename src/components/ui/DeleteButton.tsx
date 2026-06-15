"use client";

import { useLocale, useTranslations } from "next-intl";

/**
 * Renders a small form that posts to a delete Server Action, guarded by a
 * confirmation prompt. The action is passed in so this works for any entity.
 */
export function DeleteButton({
  action,
  id,
  confirmMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage: string;
}) {
  const t = useTranslations("actions");
  const locale = useLocale();

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-tile px-2.5 py-1.5 text-xs font-medium text-elevated hover:bg-elevated-bg"
      >
        {t("delete")}
      </button>
    </form>
  );
}

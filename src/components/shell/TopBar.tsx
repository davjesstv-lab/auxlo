"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

type EngagementStatus = "active" | "draft" | "review";

export function TopBar({
  status = "active",
  demoMode = false,
}: {
  status?: EngagementStatus;
  demoMode?: boolean;
}) {
  const t = useTranslations("topbar");

  const statusStyles: Record<EngagementStatus, string> = {
    active: "bg-low-bg text-low",
    draft: "bg-tile-blue text-ink-secondary",
    review: "bg-review-bg text-review",
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-hairline bg-white/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
          {t("engagementStatus")}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
          {t(`status.${status}`)}
        </span>
        {demoMode && (
          <span className="hidden rounded-full bg-review-bg px-3 py-1 text-xs font-medium text-review sm:inline">
            {t("demoMode")}
          </span>
        )}
      </div>

      <LanguageSwitcher />
    </header>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("topbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-1 rounded-tile border border-hairline p-0.5"
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => router.replace(pathname, { locale: l })}
            aria-pressed={active}
            className={`rounded-[10px] px-2.5 py-1 font-mono text-xs uppercase tracking-wide transition-colors ${
              active
                ? "bg-ink text-white"
                : "text-ink-secondary hover:bg-hairline/60"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

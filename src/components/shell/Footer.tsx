"use client";

import { useTranslations } from "next-intl";
import { SUPABASE_REGION } from "@/lib/supabase/config";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-hairline px-6 py-4">
      <div className="flex flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{t("note")}</span>
        <span className="font-mono uppercase tracking-wide">
          {t("region", { region: SUPABASE_REGION })}
        </span>
      </div>
    </footer>
  );
}

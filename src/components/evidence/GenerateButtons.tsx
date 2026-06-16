"use client";

import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { generateArtifactAction } from "@/app/[locale]/evidence/actions";
import type { ArtifactType } from "@/lib/domain/types";

function SubmitButton({ label }: { label: string }) {
  const t = useTranslations("evidence");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-tile border border-hairline px-3 py-1.5 text-xs font-semibold text-indigo-dark transition-colors hover:bg-tile-lavender disabled:opacity-60"
    >
      {pending ? t("generating") : label}
    </button>
  );
}

export function GenerateButtons({ type }: { type: ArtifactType }) {
  const t = useTranslations("evidence");
  const locale = useLocale();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">{t("generate")}:</span>
      {(["en", "fr"] as const).map((language) => (
        <form key={language} action={generateArtifactAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="language" value={language} />
          <SubmitButton
            label={language === "en" ? t("languageEn") : t("languageFr")}
          />
        </form>
      ))}
    </div>
  );
}

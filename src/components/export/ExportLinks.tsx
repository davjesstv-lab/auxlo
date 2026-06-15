import { getTranslations } from "next-intl/server";

/**
 * Renders PDF / DOCX download links pointing at an export route handler.
 * `basePath` must be the locale-prefixed route (e.g. /en/residency/export);
 * the Content-Disposition header on the response triggers the download.
 */
export async function ExportLinks({ basePath }: { basePath: string }) {
  const t = await getTranslations("export");
  const linkClass =
    "rounded-tile border border-hairline px-3 py-1.5 text-xs font-semibold text-indigo-dark transition-colors hover:bg-tile-lavender";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">{t("label")}:</span>
      <a href={`${basePath}?format=pdf`} className={linkClass}>
        {t("pdf")}
      </a>
      <a href={`${basePath}?format=docx`} className={linkClass}>
        {t("docx")}
      </a>
    </div>
  );
}

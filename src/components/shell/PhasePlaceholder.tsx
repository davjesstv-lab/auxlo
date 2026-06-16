import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { supabaseEnv } from "@/lib/supabase/config";

type NavKey = "residency" | "risk" | "vendors" | "evidence" | "auditPrep";

/**
 * Renders the workspace shell around a "coming in a later phase" panel for
 * nav destinations that are scaffolded but not yet built. Keeps the shell and
 * navigation fully functional across every route during early phases.
 */
export async function PhasePlaceholder({
  locale,
  navKey,
}: {
  locale: string;
  navKey: NavKey;
}) {
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("placeholder");

  return (
    <WorkspaceShell demoMode={!supabaseEnv.isConfigured}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          {tNav(navKey)}
        </h1>
      </div>
      <Card>
        <span className="font-mono text-[11px] uppercase tracking-widest text-indigo-dark">
          {t("comingSoon")}
        </span>
        <p className="mt-2 max-w-xl text-sm text-ink-secondary">
          {t("description")}
        </p>
      </Card>
    </WorkspaceShell>
  );
}

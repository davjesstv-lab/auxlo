import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { OrgSettingsForm } from "@/components/admin/OrgSettingsForm";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/data/org";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!supabaseEnv.isConfigured) redirect({ href: "/", locale });
  if (!(await getUser())) redirect({ href: "/login", locale });
  if ((await getCurrentRole()) !== "admin") redirect({ href: "/", locale });

  const t = await getTranslations("settings");
  const org = await getCurrentOrganization();
  if (!org) {
    redirect({ href: "/", locale });
    return null;
  }

  return (
    <WorkspaceShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-ink-secondary">{t("subtitle")}</p>
      </div>
      <Card>
        <OrgSettingsForm org={org} />
      </Card>
    </WorkspaceShell>
  );
}

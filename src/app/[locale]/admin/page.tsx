import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { UserAdmin } from "@/components/admin/UserAdmin";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { adminConfigured } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";
import { getCurrentRole, requireOrg } from "@/lib/data/org";
import { listOrgUsers } from "@/lib/data/admin";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Admin management is only meaningful when Supabase is configured.
  if (!supabaseEnv.isConfigured) redirect({ href: "/", locale });

  const user = await getUser();
  if (!user) redirect({ href: "/login", locale });
  if ((await getCurrentRole()) !== "admin") redirect({ href: "/", locale });

  const t = await getTranslations("admin");

  return (
    <WorkspaceShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-ink-secondary">{t("subtitle")}</p>
      </div>

      {!adminConfigured ? (
        <Card>
          <p className="text-sm text-review">{t("notConfigured")}</p>
        </Card>
      ) : (
        <Card>
          <UserAdmin
            users={await listOrgUsers((await requireOrg()).orgId)}
            currentUserId={user!.id}
          />
        </Card>
      )}
    </WorkspaceShell>
  );
}

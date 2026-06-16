import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { VendorForm } from "@/components/vendors/VendorForm";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";

export default async function NewVendorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Write paths are unavailable in demo mode.
  if (!supabaseEnv.isConfigured) redirect({ href: "/vendors", locale });
  if (!(await getUser())) redirect({ href: "/login", locale });

  const t = await getTranslations("vendors");

  return (
    <WorkspaceShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">
        {t("addTitle")}
      </h1>
      <Card className="max-w-2xl">
        <VendorForm />
      </Card>
    </WorkspaceShell>
  );
}

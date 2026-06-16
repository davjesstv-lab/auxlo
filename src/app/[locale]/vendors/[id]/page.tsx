import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { VendorForm } from "@/components/vendors/VendorForm";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getVendor } from "@/lib/data/vendors";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!supabaseEnv.isConfigured) redirect({ href: "/vendors", locale });
  if (!(await getUser())) redirect({ href: "/login", locale });

  const vendor = await getVendor(id);
  if (!vendor) notFound();

  const t = await getTranslations("vendors");

  return (
    <WorkspaceShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">
        {t("editTitle")}
      </h1>
      <Card className="max-w-2xl">
        <VendorForm vendor={vendor} />
      </Card>
    </WorkspaceShell>
  );
}

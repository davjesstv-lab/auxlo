import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { DataAssetForm } from "@/components/inventory/DataAssetForm";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getDataAsset } from "@/lib/data/dataAssets";

export default async function EditDataAssetPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!supabaseEnv.isConfigured) redirect({ href: "/inventory", locale });
  if (!(await getUser())) redirect({ href: "/login", locale });

  const asset = await getDataAsset(id);
  if (!asset) notFound();

  const t = await getTranslations("inventory");

  return (
    <WorkspaceShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">
        {t("editTitle")}
      </h1>
      <Card className="max-w-2xl">
        <DataAssetForm asset={asset} />
      </Card>
    </WorkspaceShell>
  );
}

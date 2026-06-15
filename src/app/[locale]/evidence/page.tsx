import { PhasePlaceholder } from "@/components/shell/PhasePlaceholder";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PhasePlaceholder locale={locale} navKey="evidence" />;
}

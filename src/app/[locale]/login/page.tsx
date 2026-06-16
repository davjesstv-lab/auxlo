import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { Footer } from "@/components/shell/Footer";
import { supabaseEnv } from "@/lib/supabase/config";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const tApp = await getTranslations("app");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-card border border-hairline bg-white p-8 shadow-soft">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-tile bg-indigo text-sm font-bold text-white"
              aria-hidden
            >
              M
            </span>
            <span className="font-display text-lg font-bold text-ink">
              {tApp("name")}
            </span>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">{t("subtitle")}</p>

          {supabaseEnv.isConfigured ? (
            <LoginForm />
          ) : (
            <p className="mt-6 rounded-tile bg-review-bg p-4 text-sm text-review">
              {t("notConfigured")}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

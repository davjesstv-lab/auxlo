"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(t("error"));
      return;
    }
    router.replace("/");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <label className="block text-sm font-medium text-ink-secondary">
        {t("email")}
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink-secondary">
        {t("password")}
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-elevated">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark disabled:opacity-60"
      >
        {loading ? t("signingIn") : t("submit")}
      </button>
    </form>
  );
}

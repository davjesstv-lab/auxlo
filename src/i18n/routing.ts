import { defineRouting } from "next-intl/routing";

/**
 * MapleGuard is bilingual by design: French (Quebec) and English are equal.
 * The default locale is English, but every route is available under /fr as well.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

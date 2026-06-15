"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type NavItem = {
  key:
    | "overview"
    | "residency"
    | "risk"
    | "vendors"
    | "inventory"
    | "evidence"
    | "auditPrep"
    | "admin";
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "overview", href: "/" },
  { key: "residency", href: "/residency" },
  { key: "risk", href: "/risk" },
  { key: "vendors", href: "/vendors" },
  { key: "inventory", href: "/inventory" },
  { key: "evidence", href: "/evidence" },
  { key: "auditPrep", href: "/audit-prep" },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations("nav");
  const items: NavItem[] = isAdmin
    ? [...NAV_ITEMS, { key: "admin", href: "/admin" }]
    : NAV_ITEMS;
  const tApp = useTranslations("app");
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-white px-5 py-7 md:flex">
      <div className="px-2">
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
        <p className="mt-1 text-xs text-muted">{tApp("tagline")}</p>
      </div>

      <p className="mt-9 px-2 font-mono text-[11px] uppercase tracking-widest text-muted">
        {t("sectionLabel")}
      </p>

      <nav className="mt-3 flex flex-col gap-1">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-tile px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-tile-lavender font-semibold text-indigo-dark"
                  : "text-ink-secondary hover:bg-hairline/60"
              }`}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

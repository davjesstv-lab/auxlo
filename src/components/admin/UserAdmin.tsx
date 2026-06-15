"use client";

import { useLocale, useTranslations } from "next-intl";
import { setUserRole, inviteUser, removeUser } from "@/app/[locale]/admin/actions";
import type { OrgUser } from "@/lib/data/admin";
import type { UserRole } from "@/lib/domain/types";

const ROLES: UserRole[] = ["admin", "practitioner", "client"];
const fieldClass =
  "rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";

export function UserAdmin({
  users,
  currentUserId,
}: {
  users: OrgUser[];
  currentUserId: string;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-6">
      {users.length === 0 ? (
        <p className="text-sm text-muted">{t("noUsers")}</p>
      ) : (
        <div className="flex flex-col">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            <span>{t("colUser")}</span>
            <span>{t("colRole")}</span>
          </div>
          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-hairline py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {u.email ?? u.id}
                </p>
                {u.full_name && (
                  <p className="truncate text-xs text-muted">{u.full_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <form action={setUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="user_id" value={u.id} />
                  <select name="role" defaultValue={u.role} className={fieldClass}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {t(`roles.${r}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-tile bg-indigo px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-dark"
                  >
                    {t("save")}
                  </button>
                </form>
                {u.id !== currentUserId && (
                  <form
                    action={removeUser}
                    onSubmit={(e) => {
                      if (!confirm(t("removeConfirm"))) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="user_id" value={u.id} />
                    <button
                      type="submit"
                      className="rounded-tile px-2.5 py-2 text-xs font-medium text-elevated hover:bg-elevated-bg"
                    >
                      {t("remove")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-hairline pt-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("inviteTitle")}
        </h2>
        <p className="mb-3 text-sm text-ink-secondary">{t("inviteHint")}</p>
        <form
          action={inviteUser}
          className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_auto]"
        >
          <input type="hidden" name="locale" value={locale} />
          <label className="block text-sm font-medium text-ink-secondary">
            {t("inviteEmail")}
            <input
              type="email"
              name="email"
              required
              className={`mt-1 w-full ${fieldClass}`}
            />
          </label>
          <select name="role" defaultValue="client" className={fieldClass}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`roles.${r}`)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-tile bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-secondary"
          >
            {t("invite")}
          </button>
        </form>
      </div>
    </div>
  );
}

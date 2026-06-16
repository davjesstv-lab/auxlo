"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { saveDataAsset } from "@/app/[locale]/inventory/actions";
import type { DataAsset, SensitivityLevel } from "@/lib/domain/types";

const SENSITIVITY_VALUES: SensitivityLevel[] = [
  "ordinary",
  "sensitive",
  "health",
];

const fieldClass =
  "mt-1 w-full rounded-tile border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo";
const labelClass = "block text-sm font-medium text-ink-secondary";

export function DataAssetForm({ asset }: { asset?: DataAsset }) {
  const t = useTranslations("inventory");
  const tEnum = useTranslations("enums");
  const tActions = useTranslations("actions");
  const locale = useLocale();

  return (
    <form action={saveDataAsset} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {asset && <input type="hidden" name="id" value={asset.id} />}

      <label className={labelClass}>
        {t("fields.name")}
        <input
          name="name"
          required
          defaultValue={asset?.name ?? ""}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        {t("fields.description")}
        <textarea
          name="description"
          rows={2}
          defaultValue={asset?.description ?? ""}
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          {t("fields.sensitivity")}
          <select
            name="sensitivity"
            defaultValue={asset?.sensitivity ?? "ordinary"}
            className={fieldClass}
          >
            {SENSITIVITY_VALUES.map((s) => (
              <option key={s} value={s}>
                {tEnum(`sensitivity.${s}`)}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {t("fields.subjects")}
          <input
            name="data_subjects"
            defaultValue={asset?.data_subjects ?? ""}
            className={fieldClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        {t("fields.purpose")}
        <input
          name="purpose"
          defaultValue={asset?.purpose ?? ""}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        {t("fields.retention")}
        <input
          name="retention"
          defaultValue={asset?.retention ?? ""}
          className={fieldClass}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
        >
          {tActions("save")}
        </button>
        <Link
          href="/inventory"
          className="rounded-tile px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-hairline/60"
        >
          {tActions("cancel")}
        </Link>
      </div>
    </form>
  );
}

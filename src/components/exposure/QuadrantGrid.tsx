import { getTranslations } from "next-intl/server";
import {
  RESIDENCY_AXIS,
  JURISDICTION_AXIS,
  computeExposure,
} from "@/lib/exposure/engine";
import type { Vendor } from "@/lib/domain/types";

const CELL_BG = {
  LOW: "bg-low-bg",
  REVIEW: "bg-review-bg",
  ELEVATED: "bg-elevated-bg",
} as const;

const LEGEND_DOT = {
  LOW: "bg-low",
  REVIEW: "bg-review",
  ELEVATED: "bg-elevated",
} as const;

/**
 * The two-axis exposure quadrant: physical data residency (vertical) against
 * operator jurisdiction (horizontal). Each cell is coloured by the exposure
 * level the engine computes for that combination, and vendor chips are placed
 * in the cell matching their hosting region and operator jurisdiction.
 */
export async function QuadrantGrid({ vendors }: { vendors: Vendor[] }) {
  const tEnum = await getTranslations("enums");
  const t = await getTranslations("exposure");

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[150px_repeat(3,1fr)] gap-2">
          {/* Header row: corner + jurisdiction (Axis 2) labels */}
          <div className="flex items-end px-1 pb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {t("axisResidency")} ↓ · {t("axisJurisdiction")} →
            </span>
          </div>
          {JURISDICTION_AXIS.map((j) => (
            <div
              key={j}
              className="px-1 pb-1 text-center text-xs font-semibold text-ink-secondary"
            >
              {tEnum(`jurisdiction.${j}`)}
            </div>
          ))}

          {/* One row per residency (Axis 1) */}
          {RESIDENCY_AXIS.map((residency) => (
            <FragmentRow
              key={residency}
              residency={residency}
              residencyLabel={tEnum(`residency.${residency}`)}
              vendors={vendors}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {t("legend")}
        </span>
        {(["LOW", "REVIEW", "ELEVATED"] as const).map((level) => (
          <span key={level} className="flex items-center gap-1.5 text-xs">
            <span
              className={`h-3 w-3 rounded-full ${LEGEND_DOT[level]}`}
              aria-hidden
            />
            {t(`levels.${level}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

function FragmentRow({
  residency,
  residencyLabel,
  vendors,
}: {
  residency: (typeof RESIDENCY_AXIS)[number];
  residencyLabel: string;
  vendors: Vendor[];
}) {
  return (
    <>
      <div className="flex items-center px-1 text-sm font-semibold text-ink-secondary">
        {residencyLabel}
      </div>
      {JURISDICTION_AXIS.map((jurisdiction) => {
        const { level } = computeExposure(residency, jurisdiction);
        const cellVendors = vendors.filter(
          (v) =>
            v.physical_hosting_region === residency &&
            v.operator_jurisdiction === jurisdiction,
        );
        return (
          <div
            key={jurisdiction}
            className={`min-h-24 rounded-tile p-2 ${CELL_BG[level]}`}
          >
            <div className="flex flex-wrap gap-1.5">
              {cellVendors.map((v) => (
                <span
                  key={v.id}
                  className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-xs font-medium text-ink shadow-sm"
                  title={v.name}
                >
                  {v.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

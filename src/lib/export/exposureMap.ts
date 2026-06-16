import {
  RESIDENCY_AXIS,
  JURISDICTION_AXIS,
  computeExposure,
} from "@/lib/exposure/engine";
import type { Block } from "./blocks";
import type { DataFlowWithRelations, Vendor } from "@/lib/domain/types";

export type ExposureLabels = {
  title: string;
  hint: string;
  axisCaption: string;
  residency: Record<string, string>;
  jurisdiction: Record<string, string>;
  levels: Record<string, string>;
  flowsTitle: string;
  colAsset: string;
  colVendor: string;
  colExposure: string;
  legend: string;
};

/** Builds the exposure-map document blocks: the two-axis quadrant as a table,
 * a legend, and the data-flow list with computed exposure. */
export function buildExposureBlocks(
  labels: ExposureLabels,
  vendors: Vendor[],
  flows: DataFlowWithRelations[],
): Block[] {
  const blocks: Block[] = [];

  blocks.push({ type: "paragraph", text: labels.hint });

  // Quadrant: rows = residency (Axis 1), columns = jurisdiction (Axis 2).
  const header = [labels.axisCaption, ...JURISDICTION_AXIS.map((j) => labels.jurisdiction[j])];
  const rows = RESIDENCY_AXIS.map((residency) => {
    const cells = JURISDICTION_AXIS.map((jurisdiction) => {
      const { level } = computeExposure(residency, jurisdiction);
      const names = vendors
        .filter(
          (v) =>
            v.physical_hosting_region === residency &&
            v.operator_jurisdiction === jurisdiction,
        )
        .map((v) => v.name);
      const label = labels.levels[level];
      return names.length > 0 ? `${label}: ${names.join(", ")}` : label;
    });
    return [labels.residency[residency], ...cells];
  });
  blocks.push({ type: "table", header, rows });

  blocks.push({
    type: "paragraph",
    text: `${labels.legend}: ${labels.levels.LOW} · ${labels.levels.REVIEW} · ${labels.levels.ELEVATED}`,
  });

  // Data flows.
  blocks.push({ type: "heading", level: 2, text: labels.flowsTitle });
  blocks.push({
    type: "table",
    header: [labels.colAsset, labels.colVendor, labels.colExposure],
    rows: flows.map((f) => [
      f.data_asset_name,
      f.vendor_name,
      labels.levels[f.exposure_level],
    ]),
  });

  return blocks;
}

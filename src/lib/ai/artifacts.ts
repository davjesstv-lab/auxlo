import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, anthropicEnv } from "./anthropic";
import type {
  ArtifactType,
  DataAsset,
  DataFlowWithRelations,
  FindingView,
  PrivacyOfficer,
  Vendor,
} from "@/lib/domain/types";

export const ARTIFACT_TYPES: ArtifactType[] = [
  "privacy_impact_assessment",
  "data_inventory",
  "vendor_due_diligence",
  "foreign_transfer_adequacy",
  "breach_response_runbook",
  "privacy_officer_record",
];

export type GenerationContext = {
  organizationName: string;
  jurisdiction: string;
  frameworks: string[];
  assets: DataAsset[];
  vendors: Vendor[];
  flows: DataFlowWithRelations[];
  findings: FindingView[];
  officers: PrivacyOfficer[];
};

/** Type-specific instructions to the model (the output language is set separately). */
const TYPE_INSTRUCTIONS: Record<ArtifactType, string> = {
  privacy_impact_assessment:
    "Draft a Privacy Impact Assessment (in French: Évaluation des facteurs relatifs à la vie privée / EFVP). Cover: description of the processing, the personal information involved and its sensitivity, purposes and lawful basis, data flows and any cross-border transfers, risks and mitigations, and outstanding gaps. Cite the relevant Law 25, PIPEDA, or PHIPA provisions.",
  data_inventory:
    "Draft a record of personal information (data inventory). Organize the data assets into a clear table with category, sensitivity, data subjects, purpose, and retention. Note any categories that appear incomplete.",
  vendor_due_diligence:
    "Draft a vendor due-diligence file. For each vendor, summarize its role, physical hosting region, operator parent domicile, derived operator jurisdiction, and whether a due-diligence assessment is on file. Flag vendors lacking documented due diligence and cite Law 25 art. 18.3 and PIPEDA Principle 4.1.3.",
  foreign_transfer_adequacy:
    "Draft a foreign-transfer adequacy assessment covering each flagged cross-border data flow. For each, assess the sensitivity of the information, the purpose, the protections in place, and the legal framework of the receiving jurisdiction (including US CLOUD Act exposure where the operator is US-parent). Cite Law 25 art. 17. Recommend safeguards.",
  breach_response_runbook:
    "Draft a confidentiality incident (breach) response runbook: roles and responsibilities, detection and triage, the incident register, risk-of-serious-injury assessment, notification thresholds and timelines to the Commission d'accès à l'information and affected individuals, and post-incident review. Cite Law 25 art. 3.5.",
  privacy_officer_record:
    "Draft a privacy officer accountability record documenting the designated person responsible for the protection of personal information, their title and contact information, and their responsibilities. If no privacy officer is on record, state this explicitly as a gap and provide a template to complete. Cite Law 25 art. 3.1 to 3.3 and PIPEDA Principle 4.1.",
};

function list(items: string[]): string {
  return items.length > 0 ? items.map((i) => `- ${i}`).join("\n") : "- (none recorded)";
}

function buildFacts(ctx: GenerationContext): string {
  const assets = list(
    ctx.assets.map(
      (a) =>
        `${a.name} — sensitivity: ${a.sensitivity}; subjects: ${a.data_subjects ?? "n/a"}; purpose: ${a.purpose ?? "n/a"}; retention: ${a.retention ?? "n/a"}`,
    ),
  );
  const vendors = list(
    ctx.vendors.map(
      (v) =>
        `${v.name} — role: ${v.role ?? "n/a"}; hosting region: ${v.physical_hosting_region}; operator parent: ${v.operator_parent_domicile}; operator jurisdiction: ${v.operator_jurisdiction}; due diligence on file: ${v.due_diligence_completed ? "yes" : "no"}`,
    ),
  );
  const flows = list(
    ctx.flows.map(
      (f) =>
        `${f.data_asset_name} → ${f.vendor_name} — exposure: ${f.exposure_level} (residency ${f.physical_hosting_region}, operator ${f.operator_jurisdiction})`,
    ),
  );
  const findings = list(
    ctx.findings.map(
      (f) =>
        `${f.condition} [${f.severity}] ${f.target_label ?? ""} ${f.rule ? `(${f.rule.reference})` : ""}`.trim(),
    ),
  );
  const officers = list(
    ctx.officers.map(
      (o) => `${o.full_name}${o.title ? `, ${o.title}` : ""}${o.email ? ` <${o.email}>` : ""}`,
    ),
  );

  return [
    `Organization: ${ctx.organizationName}`,
    `Primary jurisdiction: ${ctx.jurisdiction}`,
    `Frameworks in scope: ${ctx.frameworks.join(", ")}`,
    `\nData assets (personal information inventory):\n${assets}`,
    `\nVendors / operators:\n${vendors}`,
    `\nData flows and cross-border exposure:\n${flows}`,
    `\nAssessment findings:\n${findings}`,
    `\nPrivacy officers on record:\n${officers}`,
  ].join("\n");
}

const SYSTEM_PROMPT = `You are MapleGuard's privacy-documentation drafting assistant for Canadian small and mid-size organizations. You draft defensible privacy artifacts grounded in Quebec Law 25 (Loi 25), PIPEDA, and PHIPA.

Hard rules:
- Write the ENTIRE document in the language requested. For French, use proper Quebec French terminology (e.g. "renseignements personnels", "Évaluation des facteurs relatifs à la vie privée"), not machine-translated English.
- Cite the relevant articles or principles inline where they apply.
- Use ONLY the facts provided in the engagement data. Do NOT invent vendors, data, names, dates, or specifics. Where information is missing, state the assumption or gap explicitly rather than fabricating.
- This is documentation and recommendations, NOT legal advice — never assert legal conclusions as fact.
- Begin the document with a clearly visible banner stating it is a DRAFT pending review by a credentialed practitioner (and not legal advice), in the requested language.
- Output a single self-contained, clean HTML fragment using semantic tags only (h1, h2, h3, p, ul, ol, li, table, thead, tbody, tr, th, td, strong, em). Do NOT include <html>, <head>, <body>, <script>, or <style> tags, inline styles, or markdown code fences.`;

/** Removes any stray code fences or document wrappers from the model output. */
function sanitizeFragment(html: string): string {
  let out = html.trim();
  out = out.replace(/^```(?:html)?\s*/i, "").replace(/```$/i, "").trim();
  // Strip any tags we explicitly disallow, just in case.
  out = out.replace(/<\/?(?:html|head|body|script|style)[^>]*>/gi, "");
  return out.trim();
}

/**
 * Generates an artifact draft from the engagement data via the Claude API.
 * Streams the response (these are long documents) and returns a clean HTML
 * fragment. Errors propagate to the caller for handling.
 */
export async function generateArtifact(
  type: ArtifactType,
  language: "en" | "fr",
  ctx: GenerationContext,
): Promise<string> {
  const anthropic = getAnthropic();
  const languageName =
    language === "fr" ? "Quebec French (français québécois)" : "English";

  const userPrompt = `${TYPE_INSTRUCTIONS[type]}

Write the document in ${languageName}.

=== ENGAGEMENT DATA (the only facts you may rely on) ===
${buildFacts(ctx)}`;

  // Stream for the long output; adaptive thinking for the reasoning-heavy draft.
  const stream = anthropic.messages.stream({
    model: anthropicEnv.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return sanitizeFragment(text);
}

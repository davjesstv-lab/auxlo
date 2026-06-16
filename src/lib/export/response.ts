import "server-only";

export type ExportFormat = "pdf" | "docx";

const CONTENT_TYPE: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function parseFormat(url: string): ExportFormat {
  return new URL(url).searchParams.get("format") === "docx" ? "docx" : "pdf";
}

/** ASCII, dash-separated slug for filenames (accents stripped). */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "export"
  );
}

export function fileResponse(
  buffer: Buffer,
  format: ExportFormat,
  filename: string,
): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPE[format],
      "Content-Disposition": `attachment; filename="${filename}.${format}"`,
      "Cache-Control": "no-store",
    },
  });
}

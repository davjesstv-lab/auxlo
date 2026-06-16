import "server-only";
import PDFDocument from "pdfkit";
import type { Block } from "./blocks";

const HEADING_SIZE = { 1: 17, 2: 14, 3: 12 } as const;

/** Renders a title + blocks to a PDF file buffer using the built-in fonts
 * (Helvetica covers Latin-1, so French accents render correctly). */
export function blocksToPdf(title: string, blocks: Block[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54, size: "LETTER" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(22).text(title);
    doc.moveDown(0.8);

    for (const block of blocks) {
      switch (block.type) {
        case "heading":
          doc.moveDown(0.4);
          doc
            .font("Helvetica-Bold")
            .fontSize(HEADING_SIZE[block.level])
            .text(block.text);
          doc.moveDown(0.2);
          break;
        case "paragraph":
          doc.font("Helvetica").fontSize(10.5).text(block.text, { align: "left" });
          doc.moveDown(0.4);
          break;
        case "list":
          doc.font("Helvetica").fontSize(10.5);
          block.items.forEach((item, i) => {
            const prefix = block.ordered ? `${i + 1}. ` : "•  ";
            doc.text(prefix + item, { indent: 12 });
          });
          doc.moveDown(0.4);
          break;
        case "table":
          renderTable(doc, block.header, block.rows);
          doc.moveDown(0.4);
          break;
      }
    }

    doc.end();
  });
}

function renderTable(
  doc: PDFKit.PDFDocument,
  header: string[] | null,
  rows: string[][],
): void {
  const allRows = header ? [header, ...rows] : rows;
  if (allRows.length === 0) return;
  const cols = Math.max(...allRows.map((r) => r.length));
  const left = doc.page.margins.left;
  const usable =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = usable / cols;

  allRows.forEach((row, rowIndex) => {
    const isHeader = header !== null && rowIndex === 0;
    doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(9.5);

    // Measure the tallest cell so the row height fits multi-line text.
    const heights = row.map(
      (c) => doc.heightOfString(c || "", { width: colWidth - 8 }) + 6,
    );
    const rowHeight = Math.max(14, ...heights);

    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
    const y = doc.y;
    for (let c = 0; c < cols; c++) {
      const x = left + c * colWidth;
      doc.rect(x, y, colWidth, rowHeight).strokeColor("#ecedf2").stroke();
      doc.fillColor("#131c25").text(row[c] ?? "", x + 4, y + 3, {
        width: colWidth - 8,
      });
    }
    doc.y = y + rowHeight;
  });
}

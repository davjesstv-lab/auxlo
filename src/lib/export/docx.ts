import "server-only";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { Block } from "./blocks";

const HEADING = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
} as const;

function cell(text: string, bold = false): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });
}

function blockToElements(block: Block): (Paragraph | Table)[] {
  switch (block.type) {
    case "heading":
      return [new Paragraph({ text: block.text, heading: HEADING[block.level] })];
    case "paragraph":
      return [new Paragraph({ text: block.text })];
    case "list":
      return block.items.map((item, i) =>
        block.ordered
          ? new Paragraph({ text: `${i + 1}. ${item}` })
          : new Paragraph({ text: item, bullet: { level: 0 } }),
      );
    case "table": {
      const rows: TableRow[] = [];
      if (block.header) {
        rows.push(
          new TableRow({
            tableHeader: true,
            children: block.header.map((c) => cell(c, true)),
          }),
        );
      }
      for (const r of block.rows) {
        rows.push(new TableRow({ children: r.map((c) => cell(c)) }));
      }
      return [
        new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      ];
    }
  }
}

/** Renders a title + blocks to a .docx file buffer. */
export async function blocksToDocx(
  title: string,
  blocks: Block[],
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
  ];
  for (const block of blocks) {
    children.push(...blockToElements(block));
  }
  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

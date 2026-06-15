import { parse, type HTMLElement, NodeType } from "node-html-parser";

/** Normalized document block model shared by the PDF and DOCX renderers. */
export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[] | null; rows: string[][] };

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isElement(node: unknown): node is HTMLElement {
  return (node as { nodeType?: number })?.nodeType === NodeType.ELEMENT_NODE;
}

function tableBlock(el: HTMLElement): Block {
  const trs = el.querySelectorAll("tr");
  const rows = trs.map((tr) =>
    tr.querySelectorAll("th,td").map((c) => clean(c.text)),
  );
  const firstHasHeader =
    trs.length > 0 && trs[0].querySelectorAll("th").length > 0;
  if (firstHasHeader) {
    return { type: "table", header: rows[0] ?? [], rows: rows.slice(1) };
  }
  return { type: "table", header: null, rows };
}

function walk(node: HTMLElement, blocks: Block[]): void {
  for (const child of node.childNodes) {
    if (!isElement(child)) continue;
    const tag = child.rawTagName?.toLowerCase();
    switch (tag) {
      case "h1":
        blocks.push({ type: "heading", level: 1, text: clean(child.text) });
        break;
      case "h2":
        blocks.push({ type: "heading", level: 2, text: clean(child.text) });
        break;
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        blocks.push({ type: "heading", level: 3, text: clean(child.text) });
        break;
      case "p":
      case "blockquote": {
        const text = clean(child.text);
        if (text) blocks.push({ type: "paragraph", text });
        break;
      }
      case "ul":
      case "ol":
        blocks.push({
          type: "list",
          ordered: tag === "ol",
          items: child
            .querySelectorAll("li")
            .map((li) => clean(li.text))
            .filter(Boolean),
        });
        break;
      case "table":
        blocks.push(tableBlock(child));
        break;
      default:
        // Container element (div, section, article, header, ...): recurse.
        walk(child, blocks);
    }
  }
}

/**
 * Parses a clean HTML fragment (as produced by the artifact generator) into a
 * normalized block list for export. Inline formatting is flattened to text.
 */
export function htmlToBlocks(html: string): Block[] {
  const root = parse(html);
  const blocks: Block[] = [];
  walk(root, blocks);
  if (blocks.length === 0) {
    const text = clean(root.text);
    if (text) blocks.push({ type: "paragraph", text });
  }
  return blocks;
}

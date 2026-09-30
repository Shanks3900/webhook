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

const str = (v) => (v !== null && typeof v === "object" ? JSON.stringify(v) : String(v ?? ""));

const cell = (text, bold = false) =>
  new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });

const row = (cells, bold = false) =>
  new TableRow({ children: cells.map((c) => cell(c, bold)) });

const table = (rows) =>
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });

export function briefName(payload) {
  const title = String(payload.title ?? "report")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "report";
  return `Brief-${title}-${new Date().toISOString().replace(/[:.]/g, "-")}.docx`;
}

export async function buildBrief(payload) {
  const title = String(payload.title ?? "Report Brief");
  const fields = Object.entries(payload).filter(([k]) => k !== "title" && k !== "items");
  const items = Array.isArray(payload.items) ? payload.items : [];

  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [new TextRun({ text: `Generated ${new Date().toISOString()}`, italics: true })],
    }),
    new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_1 }),
    new Paragraph(
      `This brief covers ${fields.length} field(s) and ${items.length} item(s) received via webhook.`
    ),
  ];

  if (fields.length) {
    children.push(
      new Paragraph({ text: "Details", heading: HeadingLevel.HEADING_1 }),
      table([row(["Field", "Value"], true), ...fields.map(([k, v]) => row([k, str(v)]))])
    );
  }

  if (items.length) {
    const isObjects = items.every((i) => i && typeof i === "object" && !Array.isArray(i));
    children.push(new Paragraph({ text: "Items", heading: HeadingLevel.HEADING_1 }));
    if (isObjects) {
      const cols = [...new Set(items.flatMap((i) => Object.keys(i)))];
      children.push(
        table([row(cols, true), ...items.map((i) => row(cols.map((c) => str(i[c]))))])
      );
    } else {
      items.forEach((i) =>
        children.push(new Paragraph({ text: str(i), bullet: { level: 0 } }))
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

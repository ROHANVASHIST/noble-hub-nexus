import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import type { PaperFormat } from "./paperFormats";

const safeFilename = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "paper";

const downloadBlob = (blob: Blob, filename: string) => {
  // Fallback if file-saver isn't installed; create link directly.
  try {
    saveAs(blob, filename);
  } catch {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

const splitParagraphs = (text: string): string[] =>
  text.replace(/\r\n/g, "\n").split(/\n{2,}/).flatMap((block) =>
    block.split("\n").length === 1 ? [block] : [block]
  );

export const exportPaperToDocx = async (
  format: PaperFormat,
  values: Record<string, string>,
  paperTitle: string
) => {
  const titleText = values.title?.trim() || paperTitle || format.name;

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: titleText, bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: format.name + " · Generated with NobelHub",
          italics: true,
          size: 20,
          color: "888888",
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun("")] }),
  ];

  format.sections.forEach((section) => {
    if (section.key === "title") return; // already rendered
    const value = (values[section.key] ?? "").trim();
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: section.title, bold: true })],
      })
    );
    if (!value) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "[Section left blank]",
              italics: true,
              color: "999999",
            }),
          ],
        })
      );
      return;
    }
    value.split(/\n/).forEach((line) => {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: line, size: 22 })],
        })
      );
    });
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${safeFilename(titleText)}.docx`);
};

export const exportPaperToPdf = (
  format: PaperFormat,
  values: Record<string, string>,
  paperTitle: string
) => {
  const titleText = values.title?.trim() || paperTitle || format.name;
  const sectionsHtml = format.sections
    .filter((s) => s.key !== "title")
    .map((section) => {
      const value = (values[section.key] ?? "").trim();
      const body = value
        ? value
            .split(/\n/)
            .map((l) => `<p>${escapeHtml(l)}</p>`)
            .join("")
        : `<p class="empty">[Section left blank]</p>`;
      return `<section><h2>${escapeHtml(section.title)}</h2>${body}</section>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <title>${escapeHtml(titleText)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#111;max-width:780px;margin:40px auto;padding:0 32px;line-height:1.6}
    h1{font-size:28px;text-align:center;margin-bottom:6px}
    .meta{text-align:center;color:#888;font-size:12px;margin-bottom:32px;font-style:italic}
    h2{font-size:16px;margin-top:24px;margin-bottom:10px;color:#1a1a2e;border-bottom:1px solid #e5e5e5;padding-bottom:4px}
    p{font-size:13px;margin-bottom:8px;white-space:pre-wrap}
    .empty{color:#bbb;font-style:italic}
    @media print{body{margin:0;padding:24px}}
  </style></head><body>
  <h1>${escapeHtml(titleText)}</h1>
  <div class="meta">${escapeHtml(format.name)} · Generated with NobelHub</div>
  ${sectionsHtml}
  <script>window.onload=()=>setTimeout(()=>window.print(),250)</script>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

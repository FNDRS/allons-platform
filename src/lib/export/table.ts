/**
 * Client-side table exports. One column spec feeds every format, so a CSV,
 * a spreadsheet and a PDF of the same rows can't disagree. The heavy
 * libraries (jsPDF, fflate) load only when someone actually exports.
 */

export type ColumnKind = "text" | "int" | "money";

export interface ExportColumn<Row> {
  /** Stable key for JSON output. */
  key: string;
  header: string;
  kind: ColumnKind;
  /** Spreadsheet column width, in characters. */
  width?: number;
  value: (row: Row) => string | number;
}

export interface ExportTable<Row> {
  title: string;
  /** Lines under the title in the PDF (event, filters, generated at). */
  subtitle?: string[];
  columns: ExportColumn<Row>[];
  rows: Row[];
  /** Totals row; keyed by column key, blanks elsewhere. */
  totals?: Record<string, string | number>;
}

export type ExportFormat = "pdf" | "xlsx" | "csv" | "json";

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Safari drops the download if the URL is revoked in the same tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function cellText(value: string | number, kind: ColumnKind): string {
  if (typeof value === "number" && kind === "money") return value.toFixed(2);
  return String(value);
}

function totalsRow<Row>(table: ExportTable<Row>): (string | number)[] | null {
  if (!table.totals) return null;
  return table.columns.map((column) => table.totals?.[column.key] ?? "");
}

/** A name typed by a buyer must never run as a formula in Excel or Sheets. */
function neutralizeFormula(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function delimited<Row>(table: ExportTable<Row>, separator: string): string {
  const escape = (text: string) =>
    text.includes(separator) || /["\n\r]/.test(text)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  const lines: string[][] = [
    table.columns.map((column) => column.header),
    ...table.rows.map((row) =>
      table.columns.map((column) => {
        const value = column.value(row);
        const text = cellText(value, column.kind);
        return typeof value === "string" ? neutralizeFormula(text) : text;
      }),
    ),
  ];
  const totals = totalsRow(table);
  if (totals) {
    lines.push(
      totals.map((value, index) => cellText(value, table.columns[index].kind)),
    );
  }
  return lines.map((line) => line.map(escape).join(separator)).join("\r\n");
}

export function toCsv<Row>(table: ExportTable<Row>): Blob {
  // The BOM tells Excel the file is UTF-8, otherwise accents come out garbled.
  return new Blob(["﻿", delimited(table, ",")], {
    type: "text/csv;charset=utf-8",
  });
}

/** Tab-separated, which pastes straight into cells in Excel and Sheets. */
export function toTsv<Row>(table: ExportTable<Row>): string {
  return delimited(table, "\t");
}

export function toJson<Row>(table: ExportTable<Row>): Blob {
  const rows = table.rows.map((row) =>
    Object.fromEntries(
      table.columns.map((column) => [column.key, column.value(row)]),
    ),
  );
  return new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
}

function xmlEscape(text: string): string {
  return text
    // XML 1.0 has no representation for most control characters.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnLetter(index: number): string {
  let letter = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

// Style ids in STYLES below: 0 plain, 1 bold, 2 money, 3 bold money.
function xlsxCell(
  ref: string,
  value: string | number,
  kind: ColumnKind,
  bold: boolean,
): string {
  if (typeof value === "number") {
    const style = kind === "money" ? (bold ? 3 : 2) : bold ? 1 : 0;
    return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
  }
  if (value === "") return "";
  return `<c r="${ref}" t="inlineStr" s="${bold ? 1 : 0}"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/** A real .xlsx (Office Open XML), with typed number cells, a frozen header and filters. */
export async function toXlsx<Row>(
  table: ExportTable<Row>,
  sheetName = "Hoja 1",
): Promise<Blob> {
  const { zipSync, strToU8 } = await import("fflate");
  const lastColumn = columnLetter(table.columns.length - 1);
  const sheetRows: string[] = [];

  sheetRows.push(
    `<row r="1">${table.columns
      .map((column, index) => xlsxCell(`${columnLetter(index)}1`, column.header, "text", true))
      .join("")}</row>`,
  );
  table.rows.forEach((row, rowIndex) => {
    const r = rowIndex + 2;
    sheetRows.push(
      `<row r="${r}">${table.columns
        .map((column, index) =>
          xlsxCell(`${columnLetter(index)}${r}`, column.value(row), column.kind, false),
        )
        .join("")}</row>`,
    );
  });
  const totals = totalsRow(table);
  if (totals) {
    const r = table.rows.length + 2;
    sheetRows.push(
      `<row r="${r}">${totals
        .map((value, index) =>
          xlsxCell(`${columnLetter(index)}${r}`, value, table.columns[index].kind, true),
        )
        .join("")}</row>`,
    );
  }

  const cols = table.columns
    .map(
      (column, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${column.width ?? 14}" customWidth="1"/>`,
    )
    .join("");
  const dataEnd = table.rows.length + 1;
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${cols}</cols>
<sheetData>${sheetRows.join("")}</sheetData>
<autoFilter ref="A1:${lastColumn}${dataEnd}"/>
</worksheet>`;

  // Excel rejects sheet names over 31 characters or with []:*?/\
  const safeSheet = xmlEscape(sheetName.replace(/[[\]:*?/\\]/g, " ").slice(0, 31));
  const files = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${safeSheet}" sheetId="1" r:id="rId1"/></sheets>
<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${safeSheet.replace(/'/g, "''")}'!$A$1:$${lastColumn}$${dataEnd}</definedName></definedNames>
</workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(sheet),
    "xl/styles.xml": strToU8(STYLES),
  };
  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as Uint8Array<ArrayBuffer>], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** Landscape A4 with the table paginated, header repeated, and page numbers. */
export async function toPdf<Row>(table: ExportTable<Row>): Promise<Blob> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const margin = 36;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(table.title, margin, margin + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  (table.subtitle ?? []).forEach((line, index) => {
    doc.text(line, margin, margin + 26 + index * 12);
  });
  doc.setTextColor(0);

  const format = (value: string | number, kind: ColumnKind) =>
    typeof value === "number" && kind === "money"
      ? value.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : String(value);
  const totals = totalsRow(table);

  autoTable(doc, {
    startY: margin + 26 + (table.subtitle?.length ?? 0) * 12 + 6,
    margin: { left: margin, right: margin, bottom: margin + 10 },
    head: [table.columns.map((column) => column.header)],
    body: table.rows.map((row) =>
      table.columns.map((column) => format(column.value(row), column.kind)),
    ),
    foot: totals
      ? [totals.map((value, index) => format(value, table.columns[index].kind))]
      : undefined,
    showFoot: "lastPage",
    theme: "striped",
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [244, 244, 245], textColor: 20, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    // Head and foot too, so numbers line up under their header.
    didParseCell: (data) => {
      if (table.columns[data.column.index]?.kind !== "text") {
        data.cell.styles.halign = "right";
      }
    },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(140);
      doc.text(
        `Página ${doc.getNumberOfPages()}`,
        pageSize.getWidth() - margin,
        pageSize.getHeight() - margin / 2,
        { align: "right" },
      );
      doc.setTextColor(0);
    },
  });

  return doc.output("blob");
}

export async function exportTable<Row>(
  table: ExportTable<Row>,
  format: ExportFormat,
  baseName: string,
) {
  switch (format) {
    case "csv":
      return saveBlob(toCsv(table), `${baseName}.csv`);
    case "json":
      return saveBlob(toJson(table), `${baseName}.json`);
    case "xlsx":
      return saveBlob(await toXlsx(table, table.title), `${baseName}.xlsx`);
    case "pdf":
      return saveBlob(await toPdf(table), `${baseName}.pdf`);
  }
}

/** "Concierto de Año Nuevo" -> "concierto-de-ano-nuevo", safe as a file name. */
export function fileSlug(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "export"
  );
}

export interface CsvColumn<Row> {
  header: string;
  value: (row: Row) => string | number | null | undefined;
}

// Cells starting with these are run as formulas by Excel and Google Sheets. A student could put
// "=HYPERLINK(...)" in their name, so such cells are prefixed with an apostrophe.
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180 CSV with a header row and CRLF line ends, which Excel opens cleanly. */
export function toCsv<Row>(rows: readonly Row[], columns: readonly CsvColumn<Row>[]): string {
  const header = columns.map((column) => escapeCell(column.header)).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(','));
  return [header, ...body].join('\r\n') + '\r\n';
}

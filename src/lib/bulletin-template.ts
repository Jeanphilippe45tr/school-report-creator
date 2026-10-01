export type ColumnKey = "subject" | "coefficient" | "score" | "total" | "rank" | "appreciation" | "teacher";

export type BulletinTemplate = {
  title: string;
  subtitle: string | null;
  header_lines: string[];
  header_style: "banner" | "centered" | "left";
  primary_color: string;
  accent_color: string;
  columns: { key: ColumnKey; label: string }[];
  show_summary: boolean;
  comment_titles: string[];
  signature_labels: string[];
  footer_note: string | null;
};

export const COLUMN_KEYS: ColumnKey[] = ["subject", "coefficient", "score", "total", "rank", "appreciation", "teacher"];

export function hexToRgb(hex: string | null | undefined, fallback: [number, number, number]): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function normalizeTemplate(raw: any): BulletinTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const cols = Array.isArray(raw.columns)
    ? raw.columns.filter((c: any) => COLUMN_KEYS.includes(c?.key)).map((c: any) => ({ key: c.key, label: String(c.label || c.key).slice(0, 40) }))
    : [];
  if (!cols.some((c: any) => c.key === "subject")) cols.unshift({ key: "subject", label: "Matière" });
  if (!cols.some((c: any) => c.key === "score")) cols.splice(1, 0, { key: "score", label: "Note /20" });
  return {
    title: String(raw.title || "BULLETIN DE NOTES").slice(0, 80),
    subtitle: raw.subtitle ? String(raw.subtitle).slice(0, 120) : null,
    header_lines: (Array.isArray(raw.header_lines) ? raw.header_lines : []).slice(0, 5).map((s: any) => String(s).slice(0, 120)),
    header_style: ["banner", "centered", "left"].includes(raw.header_style) ? raw.header_style : "banner",
    primary_color: raw.primary_color || "#2d503c",
    accent_color: raw.accent_color || "#e8b84a",
    columns: cols.slice(0, 7),
    show_summary: raw.show_summary !== false,
    comment_titles: (Array.isArray(raw.comment_titles) ? raw.comment_titles : []).slice(0, 3).map((s: any) => String(s).slice(0, 60)),
    signature_labels: (Array.isArray(raw.signature_labels) ? raw.signature_labels : []).slice(0, 3).map((s: any) => String(s).slice(0, 50)),
    footer_note: raw.footer_note ? String(raw.footer_note).slice(0, 160) : null,
  };
}

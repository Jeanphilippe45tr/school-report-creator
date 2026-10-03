import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { mention } from "./grading";
import { normalizeTemplate, hexToRgb, type ColumnKey } from "./bulletin-template";

type Profile = {
  school_name?: string | null;
  school_address?: string | null;
  city?: string | null;
  country?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role_at_school?: string | null;
  bulletin_template?: any;
};

type Student = { first_name: string; last_name: string; matricule?: string | null; birth_date?: string | null; birth_place?: string | null; gender?: string | null; };
type Klass = { name: string; level?: string | null; school_year: string };
type ReportCard = {
  term: string; school_year: string; general_average: number | null; rank: number | null; class_size: number | null;
  appreciation?: string | null; head_teacher_note?: string | null; principal_note?: string | null;
};
type GradeRow = { subject: string; coefficient: number; score: number | null; appreciation?: string | null };

export function generateBulletinPdf(opts: {
  profile: Profile; student: Student; klass: Klass; reportCard: ReportCard; grades: GradeRow[];
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const M = 15;
  const tpl = normalizeTemplate(opts.profile.bulletin_template);
  const P = hexToRgb(tpl?.primary_color, [45, 80, 60]);
  const A = hexToRgb(tpl?.accent_color, [232, 184, 74]);
  let y = 42;

  if (tpl && tpl.header_style !== "banner") {
    const center = tpl.header_style === "centered";
    const x = center ? pageWidth / 2 : M;
    const al = { align: center ? "center" : "left" } as const;
    let hy = 12;
    doc.setTextColor(30);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    tpl.header_lines.forEach((l) => { doc.text(l, x, hy, al); hy += 4; });
    doc.setFontSize(14); doc.setTextColor(P[0], P[1], P[2]);
    doc.text(opts.profile.school_name || "Établissement scolaire", x, hy + 3, al); hy += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(60);
    const a2 = [opts.profile.school_address, opts.profile.city, opts.profile.country].filter(Boolean).join(" · ");
    if (a2) { doc.text(a2, x, hy, al); hy += 5; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(P[0], P[1], P[2]);
    doc.text(`${tpl.title.toUpperCase()} — ${opts.reportCard.term.toUpperCase()}`, pageWidth / 2, hy + 3, { align: "center" }); hy += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(60);
    doc.text(`${tpl.subtitle ? tpl.subtitle + " · " : ""}Année scolaire ${opts.reportCard.school_year}`, pageWidth / 2, hy, { align: "center" });
    doc.setDrawColor(A[0], A[1], A[2]); doc.setLineWidth(0.8); doc.line(M, hy + 3, pageWidth - M, hy + 3); doc.setLineWidth(0.2);
    y = hy + 8;
  } else {
  // Header banner
  doc.setFillColor(P[0], P[1], P[2]);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255);
  if (tpl?.header_lines.length) { doc.setFontSize(7); doc.text(tpl.header_lines.join(" · "), M, 6); }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(opts.profile.school_name || "Établissement scolaire", M, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const addr = [opts.profile.school_address, opts.profile.city, opts.profile.country].filter(Boolean).join(" · ");
  if (addr) doc.text(addr, M, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${(tpl?.title || "BULLETIN DE NOTES").toUpperCase()} — ${opts.reportCard.term.toUpperCase()}`, pageWidth - M, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Année scolaire ${opts.reportCard.school_year}`, pageWidth - M, 20, { align: "right" });

  }
  // Student box
  doc.setTextColor(20);
  doc.setDrawColor(200);
  doc.setFillColor(247, 244, 235);
  doc.roundedRect(M, y, pageWidth - M * 2, 26, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ÉLÈVE", M + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${opts.student.last_name.toUpperCase()} ${opts.student.first_name}`, M + 4, y + 13);
  doc.setFontSize(9);
  const meta = [
    opts.student.matricule ? `Matricule: ${opts.student.matricule}` : null,
    opts.student.gender ? `Sexe: ${opts.student.gender}` : null,
    opts.student.birth_date ? `Né(e) le: ${opts.student.birth_date}${opts.student.birth_place ? ` à ${opts.student.birth_place}` : ""}` : null,
  ].filter(Boolean).join("    ");
  if (meta) doc.text(meta, M + 4, y + 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CLASSE", pageWidth / 2 + 10, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(opts.klass.name, pageWidth / 2 + 10, y + 13);
  doc.setFontSize(9);
  if (opts.klass.level) doc.text(opts.klass.level, pageWidth / 2 + 10, y + 19);

  y += 32;

  // Grades table
  const totalCoef = opts.grades.filter(g => g.score != null).reduce((s, g) => s + g.coefficient, 0);
  const totalPoints = opts.grades.filter(g => g.score != null).reduce((s, g) => s + (g.score as number) * g.coefficient, 0);

  const avgTxt = `Moyenne: ${opts.reportCard.general_average != null ? opts.reportCard.general_average.toFixed(2) : "—"} /20`;
  const cols: { key: ColumnKey; label: string }[] = tpl?.columns ?? [
    { key: "subject", label: "Matière" }, { key: "coefficient", label: "Coef." }, { key: "score", label: "Note /20" },
    { key: "total", label: "Total" }, { key: "appreciation", label: "Appréciation" },
  ];
  const cell = (g: GradeRow, k: ColumnKey) => {
    switch (k) {
      case "subject": return g.subject;
      case "coefficient": return String(g.coefficient);
      case "score": return g.score != null ? g.score.toFixed(2) : "—";
      case "total": return g.score != null ? (g.score * g.coefficient).toFixed(2) : "—";
      case "appreciation": return g.appreciation || "";
      default: return "";
    }
  };
  const footCell = (k: ColumnKey, i: number) =>
    i === 0 ? "TOTAL" : k === "coefficient" ? String(totalCoef) : k === "total" ? totalPoints.toFixed(2) : i === cols.length - 1 ? avgTxt : "";
  const columnStyles: Record<number, any> = {};
  cols.forEach((c, i) => { if (["coefficient", "score", "total", "rank"].includes(c.key)) columnStyles[i] = { halign: "center" }; });

  autoTable(doc, {
    startY: y,
    head: [cols.map((c) => c.label)],
    body: opts.grades.map((g) => cols.map((c) => cell(g, c.key))),
    foot: [cols.map((c, i) => footCell(c.key, i))],
    theme: "grid",
    headStyles: { fillColor: P, textColor: 255, fontStyle: "bold", fontSize: 10 },
    footStyles: { fillColor: A, textColor: 30, fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    margin: { left: M, right: M },
    columnStyles,
  });

  let cursorY = (doc as any).lastAutoTable.finalY + 8;

  // Summary box
  doc.setFillColor(247, 244, 235);
  doc.roundedRect(M, cursorY, pageWidth - M * 2, 22, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MOYENNE GÉNÉRALE", M + 4, cursorY + 7);
  doc.setFontSize(18);
  doc.setTextColor(P[0], P[1], P[2]);
  doc.text(`${opts.reportCard.general_average != null ? opts.reportCard.general_average.toFixed(2) : "—"} / 20`, M + 4, cursorY + 16);
  doc.setTextColor(20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MENTION", pageWidth / 3 + 10, cursorY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(mention(opts.reportCard.general_average), pageWidth / 3 + 10, cursorY + 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("RANG", (pageWidth * 2) / 3, cursorY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(opts.reportCard.rank ? `${opts.reportCard.rank}${opts.reportCard.class_size ? ` / ${opts.reportCard.class_size}` : ""}` : "—", (pageWidth * 2) / 3, cursorY + 14);

  cursorY += 28;

  // Comments
  const addBlock = (title: string, content: string | null | undefined) => {
    if (!content) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title, M, cursorY);
    cursorY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content, pageWidth - M * 2);
    doc.text(lines, M, cursorY + 2);
    cursorY += lines.length * 5 + 6;
  };
  const ct = tpl?.comment_titles ?? [];
  addBlock((ct[0] || "APPRÉCIATION GÉNÉRALE").toUpperCase(), opts.reportCard.appreciation);
  addBlock((ct[1] || "PROFESSEUR PRINCIPAL").toUpperCase(), opts.reportCard.head_teacher_note);
  addBlock((ct[2] || "CHEF D'ÉTABLISSEMENT").toUpperCase(), opts.reportCard.principal_note);

  // Signatures
  const pageHeight = doc.internal.pageSize.getHeight();
  const sigY = pageHeight - 30;
  doc.setDrawColor(150);
  doc.line(M, sigY, M + 50, sigY);
  doc.line(pageWidth - M - 50, sigY, pageWidth - M, sigY);
  doc.setFontSize(8);
  const sl = tpl?.signature_labels ?? [];
  doc.text(sl[0] || "Signature de l'enseignant", M, sigY + 4);
  doc.text(sl[sl.length > 1 ? sl.length - 1 : 99] || "Signature du chef d'établissement", pageWidth - M - 50, sigY + 4);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120);
  if (tpl?.footer_note) doc.text(tpl.footer_note, pageWidth / 2, pageHeight - 10, { align: "center" });
  doc.text(`Bulletin généré par BulletinPro · ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, pageHeight - 6, { align: "center" });

  doc.save(`Bulletin-${opts.student.last_name}-${opts.student.first_name}-${opts.reportCard.term.replace(/\s/g, "")}.pdf`);
}
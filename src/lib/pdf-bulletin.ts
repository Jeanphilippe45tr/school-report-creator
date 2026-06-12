import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { mention } from "./grading";

type Profile = {
  school_name?: string | null;
  school_address?: string | null;
  city?: string | null;
  country?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role_at_school?: string | null;
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

  // Header banner
  doc.setFillColor(45, 80, 60);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(opts.profile.school_name || "Établissement scolaire", M, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const addr = [opts.profile.school_address, opts.profile.city, opts.profile.country].filter(Boolean).join(" · ");
  if (addr) doc.text(addr, M, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`BULLETIN DE NOTES — ${opts.reportCard.term.toUpperCase()}`, pageWidth - M, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Année scolaire ${opts.reportCard.school_year}`, pageWidth - M, 20, { align: "right" });

  // Student box
  doc.setTextColor(20);
  let y = 42;
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

  autoTable(doc, {
    startY: y,
    head: [["Matière", "Coef.", "Note /20", "Total", "Appréciation"]],
    body: opts.grades.map((g) => [
      g.subject,
      String(g.coefficient),
      g.score != null ? g.score.toFixed(2) : "—",
      g.score != null ? (g.score * g.coefficient).toFixed(2) : "—",
      g.appreciation || "",
    ]),
    foot: [[
      "TOTAL",
      String(totalCoef),
      "",
      totalPoints.toFixed(2),
      `Moyenne: ${opts.reportCard.general_average != null ? opts.reportCard.general_average.toFixed(2) : "—"} /20`,
    ]],
    theme: "grid",
    headStyles: { fillColor: [45, 80, 60], textColor: 255, fontStyle: "bold", fontSize: 10 },
    footStyles: { fillColor: [232, 184, 74], textColor: 30, fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    margin: { left: M, right: M },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" } },
  });

  let cursorY = (doc as any).lastAutoTable.finalY + 8;

  // Summary box
  doc.setFillColor(247, 244, 235);
  doc.roundedRect(M, cursorY, pageWidth - M * 2, 22, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MOYENNE GÉNÉRALE", M + 4, cursorY + 7);
  doc.setFontSize(18);
  doc.setTextColor(45, 80, 60);
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
  addBlock("APPRÉCIATION GÉNÉRALE", opts.reportCard.appreciation);
  addBlock("PROFESSEUR PRINCIPAL", opts.reportCard.head_teacher_note);
  addBlock("CHEF D'ÉTABLISSEMENT", opts.reportCard.principal_note);

  // Signatures
  const pageHeight = doc.internal.pageSize.getHeight();
  const sigY = pageHeight - 30;
  doc.setDrawColor(150);
  doc.line(M, sigY, M + 50, sigY);
  doc.line(pageWidth - M - 50, sigY, pageWidth - M, sigY);
  doc.setFontSize(8);
  doc.text("Signature de l'enseignant", M, sigY + 4);
  doc.text("Signature du chef d'établissement", pageWidth - M - 50, sigY + 4);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(`Bulletin généré par BulletinPro · ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, pageHeight - 6, { align: "center" });

  doc.save(`Bulletin-${opts.student.last_name}-${opts.student.first_name}-${opts.reportCard.term.replace(/\s/g, "")}.pdf`);
}
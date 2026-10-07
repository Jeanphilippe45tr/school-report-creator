import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { mention } from "./grading";
import { normalizeTemplate, hexToRgb } from "./bulletin-template";
import { PERIODS, termSeqs, type Period, type StudentResult } from "./sequences";

type Profile = { school_name?: string | null; school_address?: string | null; city?: string | null; country?: string | null; bulletin_template?: any };
type Klass = { name: string; level?: string | null };
type Stats = { classAverage: number | null; max: number | null; min: number | null; passed: number; ranked: number };

const FR = ["RÉPUBLIQUE DU CAMEROUN", "Paix – Travail – Patrie", "*******", "MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES", "*******"];
const EN = ["REPUBLIC OF CAMEROON", "Peace – Work – Fatherland", "*******", "MINISTRY OF SECONDARY EDUCATION", "*******"];
const f = (n: number | null | undefined) => (n == null ? "—" : n.toFixed(2));

export function generateSequenceBulletins(opts: {
  profile: Profile; klass: Klass; schoolYear: string; period: Period; results: StudentResult[]; stats: Stats; fileName?: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 12;
  const tpl = normalizeTemplate(opts.profile.bulletin_template);
  const P = hexToRgb(tpl?.primary_color, [45, 80, 60]);
  const A = hexToRgb(tpl?.accent_color, [232, 184, 74]);
  const annual = opts.period === "ANNUEL";
  const periodLabel = PERIODS.find((p) => p.value === opts.period)!.label;
  const school = opts.profile.school_name || "Établissement scolaire";
  const size = opts.results.length;

  opts.results.forEach((r, idx) => {
    if (idx > 0) doc.addPage();
    // Bilingual header
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    let y = 10;
    FR.forEach((l, i) => { doc.setFont("helvetica", i === 1 ? "italic" : "bold"); doc.text(l, M + 35, y + i * 3.6, { align: "center" }); });
    EN.forEach((l, i) => { doc.setFont("helvetica", i === 1 ? "italic" : "bold"); doc.text(l, W - M - 35, y + i * 3.6, { align: "center" }); });
    y += FR.length * 3.6;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(school.toUpperCase(), M + 35, y + 1, { align: "center", maxWidth: 70 });
    doc.text(school.toUpperCase(), W - M - 35, y + 1, { align: "center", maxWidth: 70 });
    const addr = [opts.profile.school_address, opts.profile.city].filter(Boolean).join(" – ");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    if (addr) { doc.text(addr, M + 35, y + 5, { align: "center" }); doc.text(addr, W - M - 35, y + 5, { align: "center" }); }
    y += 10;

    doc.setFillColor(P[0], P[1], P[2]);
    doc.rect(M, y, W - M * 2, 9, "F");
    doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(`BULLETIN DE NOTES — ${periodLabel.toUpperCase()}`, W / 2, y + 4, { align: "center" });
    doc.setFontSize(7.5); doc.setFont("helvetica", "italic");
    const enLabel = annual ? "ANNUAL REPORT CARD" : `REPORT CARD — TERM ${opts.period[1]}`;
    doc.text(`${enLabel} · Année scolaire / School year ${opts.schoolYear}`, W / 2, y + 7.7, { align: "center" });
    y += 12;

    // Student box
    doc.setTextColor(20); doc.setDrawColor(150);
    doc.rect(M, y, W - M * 2, 18);
    doc.setFontSize(8.5);
    const s = r.student;
    const kv = (k: string, v: string, x: number, yy: number) => { doc.setFont("helvetica", "bold"); doc.text(k, x, yy); doc.setFont("helvetica", "normal"); doc.text(v, x + doc.getTextWidth(k) + 1.5, yy); };
    kv("Nom et prénoms / Name:", `${s.last_name.toUpperCase()} ${s.first_name}`, M + 3, y + 5);
    kv("Classe / Class:", `${opts.klass.name}${opts.klass.level ? ` (${opts.klass.level})` : ""}`, W / 2 + 15, y + 5);
    kv("Né(e) le / Born on:", `${s.birth_date ?? "—"}${s.birth_place ? ` à ${s.birth_place}` : ""}`, M + 3, y + 10);
    kv("Effectif / Size:", String(size), W / 2 + 15, y + 10);
    kv("Matricule:", s.matricule || "—", M + 3, y + 15);
    kv("Sexe / Sex:", s.gender || "—", W / 2 + 15, y + 15);
    y += 21;

    const head = annual
      ? ["Matières / Subjects", "Coef", "Trim. 1", "Trim. 2", "Trim. 3", "Moy. /20", "Total", "Rang", "Appréciation"]
      : ["Matières / Subjects", "Coef", `Séq. ${termSeqs(Number(opts.period[1]) as 1)[0]}`, `Séq. ${termSeqs(Number(opts.period[1]) as 1)[1]}`, "Moy. /20", "Total", "Rang", "Appréciation"];
    const body = r.lines.map((l) => [l.subject, String(l.coefficient), ...l.cols.map(f), f(l.average), f(l.total), l.rank ? `${l.rank}e` : "—", l.appreciation]);
    const nCols = head.length;
    const foot = [["TOTAL", String(r.totalCoef), ...Array(nCols - 5).fill(""), r.totalPoints.toFixed(2), "", ""].slice(0, nCols)];
    foot[0][nCols - 4] = f(r.average);

    const centerCols: Record<number, any> = {};
    for (let i = 1; i < nCols - 1; i++) centerCols[i] = { halign: "center" };
    centerCols[0] = { cellWidth: 45 };

    autoTable(doc, {
      startY: y, head: [head], body, foot, theme: "grid",
      headStyles: { fillColor: P, textColor: 255, fontStyle: "bold", fontSize: 8, halign: "center" },
      footStyles: { fillColor: A, textColor: 20, fontStyle: "bold", fontSize: 8.5 },
      bodyStyles: { fontSize: 8, cellPadding: 1.4 }, margin: { left: M, right: M }, columnStyles: centerCols,
    });
    y = (doc as any).lastAutoTable.finalY + 4;

    // Summary
    const boxW = (W - M * 2 - 4) / 2;
    doc.setDrawColor(150); doc.rect(M, y, boxW, 30); doc.rect(M + boxW + 4, y, boxW, 30);
    doc.setFontSize(8.5);
    let ly = y + 5;
    const line = (k: string, v: string, x: number) => { doc.setFont("helvetica", "bold"); doc.text(k, x + 3, ly); doc.setFont("helvetica", "normal"); doc.text(v, x + boxW - 3, ly, { align: "right" }); };
    if (annual && r.termAverages) {
      line("Moy. Trim. 1 / 2 / 3:", r.termAverages.map(f).join(" / "), M); ly += 5;
    }
    doc.setTextColor(P[0], P[1], P[2]);
    line(annual ? "MOYENNE ANNUELLE:" : "MOYENNE TRIMESTRIELLE:", `${f(r.average)} / 20`, M); ly += 5;
    doc.setTextColor(20);
    line("Rang / Rank:", r.rank ? `${r.rank}e / ${size}` : "—", M); ly += 5;
    line("Mention:", mention(r.average), M); ly += 5;
    if (annual) line("Décision:", r.average == null ? "—" : r.average >= 10 ? "Admis(e) en classe supérieure" : "Redouble", M);
    ly = y + 5;
    const X2 = M + boxW + 4;
    doc.setFont("helvetica", "bold"); doc.text("PROFIL DE LA CLASSE / CLASS PROFILE", X2 + 3, ly); ly += 5;
    line("Moyenne de la classe:", f(opts.stats.classAverage), X2); ly += 5;
    line("Moyenne la plus forte:", f(opts.stats.max), X2); ly += 5;
    line("Moyenne la plus faible:", f(opts.stats.min), X2); ly += 5;
    line("Taux de réussite:", opts.stats.ranked ? `${Math.round((opts.stats.passed / opts.stats.ranked) * 100)} %` : "—", X2);
    y += 34;

    // Signatures
    const sigs = ["Le Parent / Parent", "Le Professeur principal / Class master", "Le Chef d'établissement / Principal"];
    const sw = (W - M * 2) / 3;
    const sy = Math.max(y + 4, H - 40);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    sigs.forEach((l, i) => doc.text(l, M + sw * i + sw / 2, sy, { align: "center" }));
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(120);
    doc.text(`${opts.profile.city ? opts.profile.city + ", le " : "Le "}${new Date().toLocaleDateString("fr-FR")} · Généré par CampusManager`, W / 2, H - 6, { align: "center" });
  });

  doc.save(opts.fileName ?? `Bulletins-${opts.klass.name}-${opts.period}.pdf`.replace(/\s/g, "_"));
}

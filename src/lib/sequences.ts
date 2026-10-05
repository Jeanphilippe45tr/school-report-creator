import { appreciationFor } from "./grading";

export type Period = "T1" | "T2" | "T3" | "ANNUEL";
export const PERIODS: { value: Period; label: string }[] = [
  { value: "T1", label: "1er Trimestre" },
  { value: "T2", label: "2e Trimestre" },
  { value: "T3", label: "3e Trimestre" },
  { value: "ANNUEL", label: "Bulletin annuel" },
];
export const SEQUENCES = [1, 2, 3, 4, 5, 6] as const;
export const seqLabel = (n: number) => `${n}${n === 1 ? "re" : "e"} Séquence`;
export const termSeqs = (t: 1 | 2 | 3) => [t * 2 - 1, t * 2] as const;

export type Subject = { id: string; name: string; coefficient: number };
export type StudentLite = { id: string; first_name: string; last_name: string; matricule?: string | null; birth_date?: string | null; birth_place?: string | null; gender?: string | null };
export type SeqGrade = { student_id: string; subject_id: string; sequence: number; score: number | null };

const r2 = (n: number) => Math.round(n * 100) / 100;
const mean = (xs: (number | null | undefined)[]) => {
  const v = xs.filter((x): x is number => x != null && !isNaN(x));
  return v.length ? r2(v.reduce((a, b) => a + b, 0) / v.length) : null;
};

export type SubjectLine = {
  subject: string; coefficient: number;
  cols: (number | null)[]; // seqA, seqB  OR  T1, T2, T3
  average: number | null; total: number | null; rank: number | null; appreciation: string;
};
export type StudentResult = {
  student: StudentLite; lines: SubjectLine[]; average: number | null; rank: number | null;
  totalCoef: number; totalPoints: number; termAverages?: (number | null)[];
};

function rankOf(values: { id: string; v: number | null }[]) {
  const sorted = values.filter((x) => x.v != null).sort((a, b) => (b.v as number) - (a.v as number));
  const map = new Map<string, number>();
  sorted.forEach((x, i) => {
    const prev = sorted[i - 1];
    map.set(x.id, prev && prev.v === x.v ? map.get(prev.id)! : i + 1);
  });
  return map;
}

export function computeResults(period: Period, students: StudentLite[], subjects: Subject[], grades: SeqGrade[]) {
  const g = new Map<string, number | null>();
  grades.forEach((x) => g.set(`${x.student_id}|${x.subject_id}|${x.sequence}`, x.score == null ? null : Number(x.score)));
  const get = (st: string, su: string, s: number) => g.get(`${st}|${su}|${s}`) ?? null;
  const termAvg = (st: string, su: string, t: 1 | 2 | 3) => mean(termSeqs(t).map((s) => get(st, su, s)));

  // per student per subject average + columns
  const raw = students.map((st) => {
    const lines = subjects.map((su) => {
      let cols: (number | null)[];
      let avg: number | null;
      if (period === "ANNUEL") {
        cols = [termAvg(st.id, su.id, 1), termAvg(st.id, su.id, 2), termAvg(st.id, su.id, 3)];
        avg = mean(cols);
      } else {
        const t = Number(period[1]) as 1 | 2 | 3;
        cols = termSeqs(t).map((s) => get(st.id, su.id, s));
        avg = mean(cols);
      }
      const coef = Number(su.coefficient || 1);
      return { subject: su.name, subjectId: su.id, coefficient: coef, cols, average: avg, total: avg != null ? r2(avg * coef) : null };
    });
    const valid = lines.filter((l) => l.average != null);
    const totalCoef = valid.reduce((s, l) => s + l.coefficient, 0);
    const totalPoints = r2(valid.reduce((s, l) => s + (l.total as number), 0));
    const average = totalCoef ? r2(totalPoints / totalCoef) : null;
    let termAverages: (number | null)[] | undefined;
    if (period === "ANNUEL") {
      termAverages = ([1, 2, 3] as const).map((t) => {
        const ls = subjects.map((su) => ({ a: termAvg(st.id, su.id, t), c: Number(su.coefficient || 1) })).filter((x) => x.a != null);
        const c = ls.reduce((s, x) => s + x.c, 0);
        return c ? r2(ls.reduce((s, x) => s + (x.a as number) * x.c, 0) / c) : null;
      });
    }
    return { student: st, lines, average, totalCoef, totalPoints, termAverages };
  });

  const subjRanks = new Map(subjects.map((su) => [su.id, rankOf(raw.map((r) => ({ id: r.student.id, v: r.lines.find((l) => l.subjectId === su.id)!.average })))]));
  const genRanks = rankOf(raw.map((r) => ({ id: r.student.id, v: r.average })));

  const results: StudentResult[] = raw.map((r) => ({
    ...r,
    rank: genRanks.get(r.student.id) ?? null,
    lines: r.lines.map((l) => ({
      subject: l.subject, coefficient: l.coefficient, cols: l.cols, average: l.average, total: l.total,
      rank: subjRanks.get(l.subjectId)!.get(r.student.id) ?? null,
      appreciation: l.average != null ? appreciationFor(l.average) : "",
    })),
  }));
  const avgs = results.map((r) => r.average).filter((x): x is number => x != null);
  const stats = {
    classAverage: mean(avgs),
    max: avgs.length ? Math.max(...avgs) : null,
    min: avgs.length ? Math.min(...avgs) : null,
    passed: avgs.filter((a) => a >= 10).length,
    ranked: avgs.length,
  };
  return { results, stats };
}

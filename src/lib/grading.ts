export function mention(avg: number | null | undefined): string {
  if (avg == null || isNaN(avg)) return "—";
  if (avg >= 16) return "Très Bien";
  if (avg >= 14) return "Bien";
  if (avg >= 12) return "Assez Bien";
  if (avg >= 10) return "Passable";
  if (avg >= 8) return "Insuffisant";
  return "Très Insuffisant";
}

export function appreciationFor(score: number | null | undefined): string {
  if (score == null || isNaN(score)) return "—";
  if (score >= 16) return "Excellent travail";
  if (score >= 14) return "Très bon travail";
  if (score >= 12) return "Bon travail";
  if (score >= 10) return "Travail satisfaisant";
  if (score >= 8) return "Travail insuffisant";
  return "Beaucoup d'efforts à fournir";
}

export function computeAverage(grades: { score: number | null; coefficient: number }[]): number | null {
  const valid = grades.filter((g) => g.score != null && !isNaN(g.score as number));
  if (valid.length === 0) return null;
  const totalCoef = valid.reduce((s, g) => s + (g.coefficient || 0), 0);
  if (totalCoef === 0) return null;
  const totalPoints = valid.reduce((s, g) => s + (g.score as number) * (g.coefficient || 0), 0);
  return Math.round((totalPoints / totalCoef) * 100) / 100;
}
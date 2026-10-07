import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { seqLabel, termSeqs } from "@/lib/sequences";

export const Route = createFileRoute("/_authenticated/app/notes")({
  head: () => ({ meta: [{ title: "Saisie des notes — BulletinPro" }] }),
  component: NotesEntry,
});

const db = supabase as any;

function NotesEntry() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [term, setTerm] = useState("1");
  const [seqA, seqB] = termSeqs(Number(term) as 1 | 2 | 3);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: classes } = useQuery({ queryKey: ["classes"], queryFn: async () => (await supabase.from("classes").select("*").order("name")).data ?? [] });
  const klass: any = classes?.find((c: any) => c.id === classId);
  const { data: students } = useQuery({ queryKey: ["students", classId], enabled: !!classId, queryFn: async () => (await supabase.from("students").select("*").eq("class_id", classId).order("last_name")).data ?? [] });
  const { data: subjects } = useQuery({ queryKey: ["subjects", classId], enabled: !!classId, queryFn: async () => (await supabase.from("subjects").select("*").eq("class_id", classId).order("created_at")).data ?? [] });
  const { data: existing } = useQuery({
    queryKey: ["seqgrades", classId, subjectId, term, klass?.school_year],
    enabled: !!classId && !!subjectId && !!klass,
    queryFn: async () => {
      const { data, error } = await db.from("sequence_grades").select("student_id, sequence, score").eq("class_id", classId).eq("subject_id", subjectId).in("sequence", [seqA, seqB]).eq("school_year", klass!.school_year);
      if (error) throw error;
      return data as { student_id: string; sequence: number; score: number | null }[];
    },
  });

  useEffect(() => {
    const v: Record<string, string> = {};
    existing?.forEach((e) => { if (e.score != null) v[`${e.student_id}|${e.sequence}`] = String(e.score); });
    setValues(v);
  }, [existing]);

  async function save() {
    if (!students?.length || !klass) return;
    for (const [, v] of Object.entries(values)) {
      const n = parseFloat(v);
      if (v !== "" && (isNaN(n) || n < 0 || n > 20)) { toast.error("Les notes doivent être entre 0 et 20"); return; }
    }
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user!;
    const rows = students.flatMap((s: any) => [seqA, seqB].map((q) => {
      const v = values[`${s.id}|${q}`];
      return { owner_id: user.id, class_id: classId, student_id: s.id, subject_id: subjectId,
        school_year: klass.school_year, sequence: q, score: v != null && v !== "" ? parseFloat(v) : null };
    }));
    const { error } = await db.from("sequence_grades").upsert(rows, { onConflict: "student_id,subject_id,school_year,sequence" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Notes enregistrées");
    qc.invalidateQueries({ queryKey: ["seqgrades"] });
  }

  const subject = subjects?.find((s: any) => s.id === subjectId);
  const filled = Object.values(values).filter((v) => v !== "").length;
  const avg = (id: string) => { const n = [seqA, seqB].map((q) => parseFloat(values[`${id}|${q}`])).filter((x) => !isNaN(x)); return n.length ? (n.reduce((a, b) => a + b, 0) / n.length).toFixed(2) : "—"; };

  return (
    <AppShell title="Saisie des notes" action={
      <Button onClick={save} disabled={saving || !subjectId}>
        {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}Enregistrer
      </Button>
    }>
      <section className="rounded-xl border border-border bg-card p-5 mb-6 grid sm:grid-cols-3 gap-4">
        <div>
          <Label>Classe</Label>
          <Select value={classId} onValueChange={(v) => { setClassId(v); setSubjectId(""); }}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{classes?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.school_year})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Matière</Label>
          <Select value={subjectId} onValueChange={setSubjectId} disabled={!classId}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} (coef {s.coefficient})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trimestre</Label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1, 2, 3].map((t) => <SelectItem key={t} value={String(t)}>{t === 1 ? "1er" : `${t}e`} Trimestre (séquences {t * 2 - 1} et {t * 2})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </section>

      {!classId || !subjectId ? (
        <p className="text-sm text-muted-foreground">Choisissez une classe, une matière et un trimestre pour afficher la liste des élèves.</p>
      ) : !students?.length ? (
        <p className="text-sm text-muted-foreground">Aucun élève dans cette classe.</p>
      ) : (
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex justify-between text-sm">
            <span className="font-medium">{subject?.name} · Trimestre {term}</span>
            <span className="text-muted-foreground">{filled} / {students.length * 2} notes saisies</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-3 w-12">N°</th><th className="p-3">Nom et prénoms</th><th className="p-3 w-32">{seqLabel(seqA)} /20</th><th className="p-3 w-32">{seqLabel(seqB)} /20</th><th className="p-3 w-24">Moyenne</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s: any, i: number) => (
                <tr key={s.id}>
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium">{s.last_name.toUpperCase()} {s.first_name}</td>
                  {[seqA, seqB].map((q, c) => (
                  <td key={q} className="p-2">
                    <Input type="number" min="0" max="20" step="0.25" placeholder="—" data-cell={`${i}-${c}`} value={values[`${s.id}|${q}`] ?? ""}
                      onChange={(e) => setValues((p) => ({ ...p, [`${s.id}|${q}`]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); document.querySelector<HTMLInputElement>(`[data-cell="${i + 1}-${c}"]`)?.focus(); } }} />
                  </td>))}
                  <td className="p-3 font-semibold text-primary">{avg(s.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </AppShell>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { computeAverage, mention, appreciationFor } from "@/lib/grading";

export const Route = createFileRoute("/_authenticated/app/bulletins/new")({
  component: NewBulletin,
});

function NewBulletin() {
  const navigate = useNavigate();
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [term, setTerm] = useState<string>("Trimestre 1");
  const [schoolYear, setSchoolYear] = useState<string>(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [rank, setRank] = useState<string>("");
  const [classSize, setClassSize] = useState<string>("");
  const [appreciation, setAppreciation] = useState("");
  const [headTeacher, setHeadTeacher] = useState("");
  const [principal, setPrincipal] = useState("");
  const [scores, setScores] = useState<Record<string, { score: string; comment: string }>>({});
  const [saving, setSaving] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await supabase.from("classes").select("*").order("name")).data ?? [],
  });

  const { data: students } = useQuery({
    queryKey: ["students", classId],
    enabled: !!classId,
    queryFn: async () => (await supabase.from("students").select("*").eq("class_id", classId).order("last_name")).data ?? [],
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects", classId],
    enabled: !!classId,
    queryFn: async () => (await supabase.from("subjects").select("*").eq("class_id", classId).order("created_at")).data ?? [],
  });

  const average = useMemo(() => {
    if (!subjects) return null;
    return computeAverage(
      subjects.map((s: any) => ({
        score: scores[s.id]?.score ? parseFloat(scores[s.id].score) : null,
        coefficient: Number(s.coefficient || 1),
      })),
    );
  }, [subjects, scores]);

  async function save() {
    if (!classId || !studentId) { toast.error("Sélectionnez une classe et un élève"); return; }
    if (!subjects?.length) { toast.error("Ajoutez d'abord des matières à la classe"); return; }
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user!;
    const { data: rc, error } = await supabase.from("report_cards").insert({
      owner_id: user.id, student_id: studentId, class_id: classId,
      term, school_year: schoolYear, general_average: average,
      rank: rank ? parseInt(rank) : null,
      class_size: classSize ? parseInt(classSize) : null,
      appreciation: appreciation || mention(average),
      head_teacher_note: headTeacher || null,
      principal_note: principal || null,
    }).select().single();
    if (error || !rc) { setSaving(false); toast.error(error?.message ?? "Erreur"); return; }

    const gradeRows = subjects.map((s: any) => ({
      owner_id: user.id, report_card_id: rc.id, subject_id: s.id,
      score: scores[s.id]?.score ? parseFloat(scores[s.id].score) : null,
      coefficient: Number(s.coefficient || 1),
      teacher_comment: scores[s.id]?.comment || null,
    }));
    const { error: gErr } = await supabase.from("grades").insert(gradeRows);
    setSaving(false);
    if (gErr) { toast.error(gErr.message); return; }
    toast.success("Bulletin créé");
    navigate({ to: "/app/bulletins/$id", params: { id: rc.id } });
  }

  return (
    <AppShell
      title="Nouveau bulletin"
      action={
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          Enregistrer
        </Button>
      }
    >
      <Link to="/app/bulletins" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg font-bold mb-4">Informations</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Classe</Label>
                <Select value={classId} onValueChange={(v) => { setClassId(v); setStudentId(""); setScores({}); }}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {classes?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.school_year})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Élève</Label>
                <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
                  <SelectTrigger><SelectValue placeholder={classId ? "Sélectionner" : "Choisir la classe"} /></SelectTrigger>
                  <SelectContent>
                    {students?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.last_name.toUpperCase()} {s.first_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Période</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
                    <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
                    <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
                    <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                    <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Année scolaire</Label><Input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} /></div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg font-bold mb-4">Notes par matière</h2>
            {!classId ? (
              <p className="text-sm text-muted-foreground">Sélectionnez d'abord une classe.</p>
            ) : !subjects?.length ? (
              <p className="text-sm text-muted-foreground">Aucune matière dans cette classe. <Link to="/app/classes/$classId" params={{ classId }} className="text-primary underline">Ajouter</Link></p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-border">
                    <tr>
                      <th className="p-2 font-medium">Matière</th>
                      <th className="p-2 font-medium w-20">Coef.</th>
                      <th className="p-2 font-medium w-28">Note /20</th>
                      <th className="p-2 font-medium">Appréciation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subjects.map((s: any) => {
                      const v = scores[s.id] || { score: "", comment: "" };
                      const numeric = v.score ? parseFloat(v.score) : null;
                      return (
                        <tr key={s.id}>
                          <td className="p-2 font-medium">{s.name}</td>
                          <td className="p-2 text-muted-foreground">{s.coefficient}</td>
                          <td className="p-2">
                            <Input
                              type="number" min="0" max="20" step="0.25" value={v.score}
                              onChange={(e) => setScores((p) => ({ ...p, [s.id]: { ...v, score: e.target.value } }))}
                              placeholder="—"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={v.comment}
                              onChange={(e) => setScores((p) => ({ ...p, [s.id]: { ...v, comment: e.target.value } }))}
                              placeholder={appreciationFor(numeric)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg font-bold mb-4">Observations</h2>
            <div className="space-y-3">
              <div><Label>Appréciation générale</Label><Textarea value={appreciation} onChange={(e) => setAppreciation(e.target.value)} placeholder={mention(average)} /></div>
              <div><Label>Mot du professeur principal</Label><Textarea value={headTeacher} onChange={(e) => setHeadTeacher(e.target.value)} /></div>
              <div><Label>Mot du chef d'établissement</Label><Textarea value={principal} onChange={(e) => setPrincipal(e.target.value)} /></div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 sticky top-20">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Moyenne calculée</h3>
            <div className="mt-2 font-serif text-5xl font-bold text-primary">{average ?? "—"}{average != null && <span className="text-2xl text-muted-foreground">/20</span>}</div>
            <p className="mt-2 text-sm text-foreground font-medium">{mention(average)}</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Rang</Label><Input value={rank} onChange={(e) => setRank(e.target.value)} type="number" min="1" /></div>
              <div><Label className="text-xs">Effectif</Label><Input value={classSize} onChange={(e) => setClassSize(e.target.value)} type="number" min="1" /></div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
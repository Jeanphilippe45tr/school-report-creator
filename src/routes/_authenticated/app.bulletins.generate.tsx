import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, FileDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { mention } from "@/lib/grading";
import { PERIODS, computeResults, type Period } from "@/lib/sequences";
import { generateSequenceBulletins } from "@/lib/pdf-sequence-bulletin";

export const Route = createFileRoute("/_authenticated/app/bulletins/generate")({
  head: () => ({ meta: [{ title: "Générer les bulletins — CampusManager" }] }),
  component: GenerateBulletins,
});

const db = supabase as any;

function GenerateBulletins() {
  const [classId, setClassId] = useState("");
  const [period, setPeriod] = useState<Period>("T1");

  const { data: classes } = useQuery({ queryKey: ["classes"], queryFn: async () => (await supabase.from("classes").select("*").order("name")).data ?? [] });
  const klass: any = classes?.find((c: any) => c.id === classId);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: async () => {
    const uid = (await supabase.auth.getUser()).data.user!.id;
    return (await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()).data;
  } });
  const { data } = useQuery({
    queryKey: ["generate", classId, klass?.school_year],
    enabled: !!klass,
    queryFn: async () => {
      const [st, su, gr] = await Promise.all([
        supabase.from("students").select("*").eq("class_id", classId).order("last_name"),
        supabase.from("subjects").select("*").eq("class_id", classId).order("created_at"),
        db.from("sequence_grades").select("student_id, subject_id, sequence, score").eq("class_id", classId).eq("school_year", klass.school_year),
      ]);
      return { students: st.data ?? [], subjects: su.data ?? [], grades: gr.data ?? [] };
    },
  });

  const computed = useMemo(() => data ? computeResults(period, data.students as any, data.subjects as any, data.grades) : null, [data, period]);
  const annual = period === "ANNUEL";

  function download(onlyId?: string) {
    if (!computed || !klass) return;
    const results = onlyId ? computed.results.filter((r) => r.student.id === onlyId) : computed.results;
    generateSequenceBulletins({
      profile: profile ?? {}, klass, schoolYear: klass.school_year, period, results, stats: computed.stats,
      fileName: onlyId ? `Bulletin-${results[0].student.last_name}-${period}.pdf` : undefined,
    });
  }

  return (
    <AppShell title="Générer les bulletins" action={
      <Button onClick={() => download()} disabled={!computed?.results.length}><FileDown className="h-4 w-4 mr-1.5" />Toute la classe (PDF)</Button>
    }>
      <Link to="/app/bulletins" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Link>
      <section className="rounded-xl border border-border bg-card p-5 mb-6 grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Classe</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{classes?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.school_year})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Période</Label>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </section>

      {computed && (
        computed.results.length === 0 ? <p className="text-sm text-muted-foreground">Aucun élève dans cette classe.</p> : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <div className="px-5 py-3 border-b border-border text-sm text-muted-foreground">
            Moyenne de la classe : <b className="text-foreground">{computed.stats.classAverage ?? "—"}</b> · Réussite : {computed.stats.passed}/{computed.stats.ranked}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Rang</th><th className="p-3">Élève</th>
                {annual && <><th className="p-3">Trim. 1</th><th className="p-3">Trim. 2</th><th className="p-3">Trim. 3</th></>}
                <th className="p-3">Moyenne</th><th className="p-3">Mention</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...computed.results].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)).map((r) => (
                <tr key={r.student.id}>
                  <td className="p-3 font-medium">{r.rank ? `${r.rank}e` : "—"}</td>
                  <td className="p-3">{r.student.last_name.toUpperCase()} {r.student.first_name}</td>
                  {annual && r.termAverages?.map((t, i) => <td key={i} className="p-3 text-muted-foreground">{t ?? "—"}</td>)}
                  <td className="p-3 font-semibold text-primary">{r.average ?? "—"}</td>
                  <td className="p-3">{mention(r.average)}</td>
                  <td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => download(r.student.id)}><Download className="h-4 w-4 mr-1" />PDF</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>)
      )}
    </AppShell>
  );
}

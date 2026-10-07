import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ClassPicker } from "@/components/class-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, uid, useStudents, fullName } from "@/lib/school-data";

export const Route = createFileRoute("/_authenticated/app/vie-scolaire")({
  head: () => ({ meta: [{ title: "Absences & discipline — CampusManager" }] }),
  component: VieScolaire,
});

const SANCTIONS = ["Avertissement", "Blâme", "Consigne", "Exclusion temporaire", "Convocation des parents"];
const today = () => new Date().toISOString().slice(0, 10);

function VieScolaire() {
  const [classId, setClassId] = useState("");
  return (
    <AppShell title="Absences & discipline">
      <div className="mb-6"><ClassPicker value={classId} onChange={setClassId} /></div>
      {!classId ? <p className="text-sm text-muted-foreground">Choisissez une classe.</p> : (
        <Tabs defaultValue="abs">
          <TabsList><TabsTrigger value="abs">Absences & retards</TabsTrigger><TabsTrigger value="disc">Discipline</TabsTrigger></TabsList>
          <TabsContent value="abs" className="mt-4"><Attendance classId={classId} /></TabsContent>
          <TabsContent value="disc" className="mt-4"><Discipline classId={classId} /></TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}

function Attendance({ classId }: { classId: string }) {
  const qc = useQueryClient();
  const { data: students } = useStudents(classId);
  const [date, setDate] = useState(today());
  const [kind, setKind] = useState("absence");
  const [hours, setHours] = useState<Record<string, string>>({});
  const { data: records } = useQuery({ queryKey: ["attendance", classId], queryFn: async () => (await db.from("attendance_records").select("*").eq("class_id", classId).order("occurred_on", { ascending: false })).data ?? [] });
  const totals = useMemo(() => {
    const m = new Map<string, { abs: number; nj: number; ret: number }>();
    (records ?? []).forEach((r: any) => {
      const t = m.get(r.student_id) ?? { abs: 0, nj: 0, ret: 0 };
      if (r.kind === "retard") t.ret++; else { t.abs += Number(r.hours); if (!r.justified) t.nj += Number(r.hours); }
      m.set(r.student_id, t);
    });
    return m;
  }, [records]);
  const refresh = () => qc.invalidateQueries({ queryKey: ["attendance", classId] });

  async function save() {
    const owner = await uid();
    const rows = Object.entries(hours).filter(([, h]) => h && Number(h) > 0).map(([sid, h]) => ({ owner_id: owner, class_id: classId, student_id: sid, kind, occurred_on: date, hours: Number(h) }));
    if (!rows.length) return toast.error("Saisissez au moins une valeur");
    const { error } = await db.from("attendance_records").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`${rows.length} enregistrement(s) ajouté(s)`); setHours({}); refresh();
  }
  async function toggle(r: any) { await db.from("attendance_records").update({ justified: !r.justified }).eq("id", r.id); refresh(); }
  async function del(id: string) { await db.from("attendance_records").delete().eq("id", id); refresh(); }
  const st = new Map((students ?? []).map((s: any) => [s.id, s]));

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card overflow-x-auto">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-end">
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Type</Label><Select value={kind} onValueChange={setKind}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="absence">Absence (heures)</SelectItem><SelectItem value="retard">Retard</SelectItem></SelectContent></Select></div>
          <Button onClick={save} className="ml-auto">Enregistrer l'appel</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Élève</th><th className="p-3 w-32">{kind === "absence" ? "Heures d'absence" : "Retard (1 = oui)"}</th><th className="p-3">Total abs.</th><th className="p-3">Non justifiées</th><th className="p-3">Retards</th></tr></thead>
          <tbody className="divide-y divide-border">
            {students?.map((s: any) => { const t = totals.get(s.id); return (
              <tr key={s.id}><td className="p-3 font-medium">{fullName(s)}</td>
                <td className="p-2"><Input type="number" min="0" step={kind === "absence" ? "1" : "1"} value={hours[s.id] ?? ""} onChange={(e) => setHours({ ...hours, [s.id]: e.target.value })} placeholder="0" /></td>
                <td className="p-3">{t?.abs ?? 0} h</td><td className="p-3 text-destructive">{t?.nj ?? 0} h</td><td className="p-3">{t?.ret ?? 0}</td></tr>); })}
          </tbody>
        </table>
      </section>
      {!!records?.length && (
        <section className="rounded-xl border border-border bg-card overflow-x-auto">
          <h2 className="font-serif text-lg font-bold px-5 py-3 border-b border-border">Historique</h2>
          <table className="w-full text-sm"><tbody className="divide-y divide-border">
            {records.map((r: any) => (
              <tr key={r.id}><td className="p-3 text-muted-foreground">{r.occurred_on}</td><td className="p-3">{fullName(st.get(r.student_id))}</td><td className="p-3">{r.kind === "retard" ? "Retard" : `Absence ${r.hours} h`}</td>
                <td className="p-3"><label className="flex items-center gap-2"><Checkbox checked={r.justified} onCheckedChange={() => toggle(r)} />Justifiée</label></td>
                <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>
            ))}
          </tbody></table>
        </section>
      )}
    </div>
  );
}

function Discipline({ classId }: { classId: string }) {
  const qc = useQueryClient();
  const { data: students } = useStudents(classId);
  const { data: records } = useQuery({ queryKey: ["discipline", classId], queryFn: async () => (await db.from("discipline_records").select("*").eq("class_id", classId).order("occurred_on", { ascending: false })).data ?? [] });
  const [f, setF] = useState({ student_id: "", kind: SANCTIONS[0], occurred_on: today(), description: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["discipline", classId] });
  async function add() {
    if (!f.student_id) return toast.error("Choisissez un élève");
    const { error } = await db.from("discipline_records").insert({ ...f, class_id: classId, owner_id: await uid() });
    if (error) return toast.error(error.message);
    setF({ ...f, description: "" }); toast.success("Sanction enregistrée"); refresh();
  }
  async function del(id: string) { await db.from("discipline_records").delete().eq("id", id); refresh(); }
  const st = new Map((students ?? []).map((s: any) => [s.id, s]));
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 grid sm:grid-cols-5 gap-2 items-end">
        <div><Label>Élève</Label><Select value={f.student_id} onValueChange={(v) => setF({ ...f, student_id: v })}><SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger><SelectContent>{students?.map((s: any) => <SelectItem key={s.id} value={s.id}>{fullName(s)}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Sanction</Label><Select value={f.kind} onValueChange={(v) => setF({ ...f, kind: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SANCTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Date</Label><Input type="date" value={f.occurred_on} onChange={(e) => setF({ ...f, occurred_on: e.target.value })} /></div>
        <div><Label>Motif</Label><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
      </section>
      <section className="rounded-xl border border-border bg-card overflow-x-auto">
        {records?.length ? <table className="w-full text-sm"><tbody className="divide-y divide-border">
          {records.map((r: any) => <tr key={r.id}><td className="p-3 text-muted-foreground">{r.occurred_on}</td><td className="p-3 font-medium">{fullName(st.get(r.student_id))}</td><td className="p-3">{r.kind}</td><td className="p-3 text-muted-foreground">{r.description}</td><td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}
        </tbody></table> : <p className="p-6 text-sm text-muted-foreground">Aucune sanction pour cette classe.</p>}
      </section>
    </div>
  );
}

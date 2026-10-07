import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ClassPicker } from "@/components/class-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { db, uid } from "@/lib/school-data";

export const Route = createFileRoute("/_authenticated/app/emploi-du-temps")({
  head: () => ({ meta: [{ title: "Emploi du temps — CampusManager" }] }),
  component: Timetable,
});

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function Timetable() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const { data: subjects } = useQuery({ queryKey: ["subjects", classId], enabled: !!classId, queryFn: async () => (await supabase.from("subjects").select("*").eq("class_id", classId).order("name")).data ?? [] });
  const { data: slots } = useQuery({ queryKey: ["timetable", classId], enabled: !!classId, queryFn: async () => (await db.from("timetable_slots").select("*").eq("class_id", classId).order("start_time")).data ?? [] });
  const [f, setF] = useState({ day: "1", start_time: "07:30", end_time: "09:30", subject_id: "", teacher: "", room: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["timetable", classId] });

  async function add() {
    if (!f.subject_id) return toast.error("Choisissez une matière");
    if (f.end_time <= f.start_time) return toast.error("L'heure de fin doit être après le début");
    const { error } = await db.from("timetable_slots").insert({ ...f, day: Number(f.day), class_id: classId, owner_id: await uid() });
    if (error) return toast.error(error.message);
    refresh();
  }
  async function del(id: string) { await db.from("timetable_slots").delete().eq("id", id); refresh(); }
  const subj = new Map((subjects ?? []).map((s: any) => [s.id, s.name]));

  return (
    <AppShell title="Emploi du temps">
      <div className="mb-6"><ClassPicker value={classId} onChange={setClassId} /></div>
      {!classId ? <p className="text-sm text-muted-foreground">Choisissez une classe.</p> : (
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 grid sm:grid-cols-7 gap-2 items-end">
            <div><Label>Jour</Label><Select value={f.day} onValueChange={(v) => setF({ ...f, day: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DAYS.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Début</Label><Input type="time" value={f.start_time} onChange={(e) => setF({ ...f, start_time: e.target.value })} /></div>
            <div><Label>Fin</Label><Input type="time" value={f.end_time} onChange={(e) => setF({ ...f, end_time: e.target.value })} /></div>
            <div><Label>Matière</Label><Select value={f.subject_id} onValueChange={(v) => setF({ ...f, subject_id: v })}><SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger><SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Enseignant</Label><Input value={f.teacher} onChange={(e) => setF({ ...f, teacher: e.target.value })} /></div>
            <div><Label>Salle</Label><Input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} /></div>
            <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
          </section>
          <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
            {DAYS.map((d, i) => (
              <div key={d} className="rounded-xl border border-border bg-card">
                <div className="px-3 py-2 border-b border-border bg-primary text-primary-foreground rounded-t-xl font-semibold text-sm">{d}</div>
                <div className="p-2 space-y-2 min-h-24">
                  {slots?.filter((s: any) => s.day === i + 1).map((s: any) => (
                    <div key={s.id} className="rounded-md bg-primary-soft p-2 text-xs relative group">
                      <button onClick={() => del(s.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" aria-label="Supprimer"><X className="h-3 w-3" /></button>
                      <div className="font-semibold">{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</div>
                      <div className="text-foreground">{(subj.get(s.subject_id) as string) ?? s.label ?? "—"}</div>
                      {(s.teacher || s.room) && <div className="text-muted-foreground">{[s.teacher, s.room].filter(Boolean).join(" · ")}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

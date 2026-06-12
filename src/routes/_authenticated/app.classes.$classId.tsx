import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, UserPlus, Trash2, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/classes/$classId")({
  component: ClassDetail,
});

function ClassDetail() {
  const { classId } = Route.useParams();
  const qc = useQueryClient();
  const [studentOpen, setStudentOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  const { data: klass } = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").eq("id", classId).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").eq("class_id", classId).order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects", classId],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").eq("class_id", classId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const addStudent = useMutation({
    mutationFn: async (input: any) => {
      const user = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("students").insert({ ...input, class_id: classId, owner_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Élève ajouté"); qc.invalidateQueries({ queryKey: ["students", classId] }); setStudentOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeStudent = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("students").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Élève supprimé"); qc.invalidateQueries({ queryKey: ["students", classId] }); },
  });

  const addSubject = useMutation({
    mutationFn: async (input: any) => {
      const user = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("subjects").insert({ ...input, class_id: classId, owner_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Matière ajoutée"); qc.invalidateQueries({ queryKey: ["subjects", classId] }); setSubjectOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeSubject = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("subjects").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Matière supprimée"); qc.invalidateQueries({ queryKey: ["subjects", classId] }); },
  });

  return (
    <AppShell title={klass?.name ?? "Classe"}>
      <Link to="/app/classes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Toutes les classes
      </Link>

      <div className="rounded-xl bg-card border border-border p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary-soft text-primary grid place-items-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">{klass?.name}</h2>
            <p className="text-sm text-muted-foreground">{klass?.level || "—"} · Année {klass?.school_year}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Élèves ({students?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="subjects">Matières ({subjects?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="flex justify-end mb-4">
            <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
              <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-1.5" />Ajouter un élève</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvel élève</DialogTitle></DialogHeader>
                <form id="new-student-form" className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  addStudent.mutate({
                    first_name: String(f.get("first_name") || "").trim(),
                    last_name: String(f.get("last_name") || "").trim(),
                    matricule: String(f.get("matricule") || "").trim() || null,
                    birth_date: String(f.get("birth_date") || "") || null,
                    birth_place: String(f.get("birth_place") || "").trim() || null,
                    gender: String(f.get("gender") || "") || null,
                    parent_name: String(f.get("parent_name") || "").trim() || null,
                    parent_phone: String(f.get("parent_phone") || "").trim() || null,
                  });
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Prénom</Label><Input name="first_name" required /></div>
                    <div><Label>Nom</Label><Input name="last_name" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Matricule</Label><Input name="matricule" /></div>
                    <div><Label>Sexe</Label>
                      <Select name="gender">
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date de naissance</Label><Input name="birth_date" type="date" /></div>
                    <div><Label>Lieu</Label><Input name="birth_place" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Parent / tuteur</Label><Input name="parent_name" /></div>
                    <div><Label>Téléphone parent</Label><Input name="parent_phone" /></div>
                  </div>
                </form>
                <DialogFooter><Button form="new-student-form" type="submit" disabled={addStudent.isPending}>Ajouter</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {students?.length ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">Élève</th>
                    <th className="p-3 font-medium hidden sm:table-cell">Matricule</th>
                    <th className="p-3 font-medium hidden md:table-cell">Sexe</th>
                    <th className="p-3 font-medium hidden md:table-cell">Né(e) le</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s: any) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{s.last_name.toUpperCase()} {s.first_name}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{s.matricule || "—"}</td>
                      <td className="p-3 hidden md:table-cell">{s.gender || "—"}</td>
                      <td className="p-3 hidden md:table-cell">{s.birth_date || "—"}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => { if (confirm("Supprimer cet élève ?")) removeStudent.mutate(s.id); }} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Aucun élève dans cette classe.</div>
          )}
        </TabsContent>

        <TabsContent value="subjects">
          <div className="flex justify-end mb-4">
            <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Ajouter une matière</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvelle matière</DialogTitle></DialogHeader>
                <form id="new-subj-form" className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  addSubject.mutate({
                    name: String(f.get("name") || "").trim(),
                    coefficient: Number(f.get("coefficient") || 1),
                  });
                }}>
                  <div><Label>Nom de la matière</Label><Input name="name" required placeholder="Mathématiques" /></div>
                  <div><Label>Coefficient</Label><Input name="coefficient" type="number" step="0.5" min="0.5" defaultValue="1" required /></div>
                </form>
                <DialogFooter><Button form="new-subj-form" type="submit" disabled={addSubject.isPending}>Ajouter</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {subjects?.length ? (
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {subjects.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted-foreground">Coefficient {s.coefficient}</div>
                  </div>
                  <button onClick={() => { if (confirm("Supprimer cette matière ?")) removeSubject.mutate(s.id); }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Ajoutez les matières enseignées dans cette classe.</div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
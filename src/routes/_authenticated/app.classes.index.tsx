import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/classes/")({
  component: ClassesPage,
});

function ClassesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*, students(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createClass = useMutation({
    mutationFn: async (input: { name: string; level: string; school_year: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("classes").insert({ ...input, owner_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Classe créée");
      qc.invalidateQueries({ queryKey: ["classes"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Classe supprimée");
      qc.invalidateQueries({ queryKey: ["classes"] });
    },
  });

  return (
    <AppShell
      title="Classes & élèves"
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" />Nouvelle classe</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer une classe</DialogTitle></DialogHeader>
            <form
              id="new-class-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                createClass.mutate({
                  name: String(f.get("name") || "").trim(),
                  level: String(f.get("level") || "").trim(),
                  school_year: String(f.get("school_year") || "").trim(),
                });
              }}
              className="space-y-4"
            >
              <div><Label>Nom de la classe</Label><Input name="name" required placeholder="6ème A" /></div>
              <div><Label>Niveau</Label><Input name="level" placeholder="Collège · 6ème" /></div>
              <div><Label>Année scolaire</Label><Input name="school_year" required placeholder="2025-2026" /></div>
            </form>
            <DialogFooter>
              <Button type="submit" form="new-class-form" disabled={createClass.isPending}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {classes?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)] transition group">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary grid place-items-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <button
                  onClick={() => { if (confirm(`Supprimer la classe ${c.name} ?`)) removeClass.mutate(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold">{c.name}</h3>
              <p className="text-sm text-muted-foreground">{c.level || "—"} · {c.school_year}</p>
              <p className="mt-3 text-sm text-muted-foreground">{c.students?.[0]?.count ?? 0} élève(s)</p>
              <Link to="/app/classes/$classId" params={{ classId: c.id }}>
                <Button variant="ghost" className="mt-4 w-full justify-between">Gérer <ChevronRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState onCreate={() => setOpen(true)} />
      )}
    </AppShell>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
      <h3 className="mt-4 font-serif text-xl font-bold">Aucune classe</h3>
      <p className="mt-1 text-muted-foreground">Commencez par créer votre première classe.</p>
      <Button className="mt-6" onClick={onCreate}><Plus className="h-4 w-4 mr-1.5" />Créer une classe</Button>
    </div>
  );
}
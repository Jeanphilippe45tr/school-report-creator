import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mention, appreciationFor } from "@/lib/grading";
import { generateBulletinPdf } from "@/lib/pdf-bulletin";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/bulletins/$id")({
  component: BulletinView,
});

function BulletinView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["bulletin", id],
    queryFn: async () => {
      const { data: rc, error } = await supabase.from("report_cards")
        .select("*, students(*), classes(*)").eq("id", id).single();
      if (error) throw error;
      const { data: grades } = await supabase.from("grades")
        .select("*, subjects(name, coefficient)")
        .eq("report_card_id", id);
      const user = (await supabase.auth.getUser()).data.user!;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { rc, grades: grades ?? [], profile };
    },
  });

  async function handleDelete() {
    if (!confirm("Supprimer ce bulletin ?")) return;
    const { error } = await supabase.from("report_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Bulletin supprimé");
    navigate({ to: "/app/bulletins" });
  }

  function handlePdf() {
    if (!data) return;
    generateBulletinPdf({
      profile: data.profile ?? {},
      student: data.rc.students,
      klass: data.rc.classes,
      reportCard: data.rc,
      grades: data.grades.map((g: any) => ({
        subject: g.subjects?.name ?? "—",
        coefficient: Number(g.coefficient || g.subjects?.coefficient || 1),
        score: g.score,
        appreciation: g.teacher_comment || appreciationFor(g.score),
      })),
    });
  }

  if (!data) return <AppShell title="Bulletin"><div className="text-muted-foreground">Chargement…</div></AppShell>;

  const { rc, grades, profile } = data;
  const totalCoef = grades.filter((g: any) => g.score != null).reduce((s: number, g: any) => s + Number(g.coefficient), 0);

  return (
    <AppShell
      title="Bulletin"
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={handlePdf}><Download className="h-4 w-4 mr-1.5" />Télécharger PDF</Button>
        </div>
      }
    >
      <Link to="/app/bulletins" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Tous les bulletins
      </Link>

      {/* On-screen preview, styled like the PDF */}
      <div className="max-w-4xl mx-auto bg-white border border-border rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden">
        <div className="bg-primary text-primary-foreground p-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold">{profile?.school_name || "Établissement scolaire"}</h2>
            <p className="text-sm text-primary-foreground/80 mt-1">
              {[profile?.school_address, profile?.city, profile?.country].filter(Boolean).join(" · ") || " "}
            </p>
          </div>
          <div className="text-right">
            <div className="font-serif font-bold">BULLETIN — {rc.term}</div>
            <div className="text-sm text-primary-foreground/80">Année {rc.school_year}</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 bg-secondary rounded-lg p-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Élève</div>
              <div className="font-semibold text-lg">{rc.students.last_name.toUpperCase()} {rc.students.first_name}</div>
              <div className="text-sm text-muted-foreground">
                {rc.students.matricule && `Matricule: ${rc.students.matricule}`}
                {rc.students.gender && ` · Sexe: ${rc.students.gender}`}
              </div>
              {rc.students.birth_date && <div className="text-sm text-muted-foreground">Né(e) le {rc.students.birth_date}{rc.students.birth_place ? ` à ${rc.students.birth_place}` : ""}</div>}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Classe</div>
              <div className="font-semibold text-lg">{rc.classes.name}</div>
              {rc.classes.level && <div className="text-sm text-muted-foreground">{rc.classes.level}</div>}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="text-left p-2.5 font-medium">Matière</th>
                <th className="p-2.5 font-medium w-16">Coef.</th>
                <th className="p-2.5 font-medium w-20">Note /20</th>
                <th className="p-2.5 font-medium w-20">Total</th>
                <th className="text-left p-2.5 font-medium">Appréciation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grades.map((g: any) => (
                <tr key={g.id}>
                  <td className="p-2.5 font-medium">{g.subjects?.name}</td>
                  <td className="p-2.5 text-center">{g.coefficient}</td>
                  <td className="p-2.5 text-center font-mono">{g.score != null ? g.score.toFixed(2) : "—"}</td>
                  <td className="p-2.5 text-center font-mono">{g.score != null ? (g.score * Number(g.coefficient)).toFixed(2) : "—"}</td>
                  <td className="p-2.5 text-muted-foreground">{g.teacher_comment || appreciationFor(g.score)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-accent/30">
              <tr className="font-bold">
                <td className="p-2.5">TOTAL</td>
                <td className="p-2.5 text-center">{totalCoef}</td>
                <td colSpan={2} className="p-2.5 text-center">Moyenne</td>
                <td className="p-2.5 font-serif">{rc.general_average != null ? `${rc.general_average} / 20` : "—"}</td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-3 gap-4">
            <Summary label="Moyenne" value={rc.general_average != null ? `${rc.general_average}/20` : "—"} big />
            <Summary label="Mention" value={mention(rc.general_average)} />
            <Summary label="Rang" value={rc.rank ? `${rc.rank}${rc.class_size ? ` / ${rc.class_size}` : ""}` : "—"} />
          </div>

          {rc.appreciation && <Block title="Appréciation générale" content={rc.appreciation} />}
          {rc.head_teacher_note && <Block title="Professeur principal" content={rc.head_teacher_note} />}
          {rc.principal_note && <Block title="Chef d'établissement" content={rc.principal_note} />}
        </div>
      </div>
    </AppShell>
  );
}

function Summary({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-serif font-bold ${big ? "text-2xl text-primary" : "text-lg"}`}>{value}</div>
    </div>
  );
}
function Block({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{title}</div>
      <p className="mt-1 text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}
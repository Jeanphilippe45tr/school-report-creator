import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText, BookOpen, Plus, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [{ count: classes }, { count: students }, { count: bulletins }, { data: recent }] = await Promise.all([
        supabase.from("classes").select("*", { count: "exact", head: true }),
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("report_cards").select("*", { count: "exact", head: true }),
        supabase.from("report_cards")
          .select("id, term, school_year, general_average, students(first_name, last_name), classes(name)")
          .order("created_at", { ascending: false }).limit(5),
      ]);
      return { classes: classes ?? 0, students: students ?? 0, bulletins: bulletins ?? 0, recent: recent ?? [] };
    },
  });

  const stats = [
    { label: "Classes", value: data?.classes ?? 0, icon: BookOpen, color: "bg-primary-soft text-primary" },
    { label: "Élèves", value: data?.students ?? 0, icon: Users, color: "bg-secondary text-secondary-foreground" },
    { label: "Bulletins générés", value: data?.bulletins ?? 0, icon: FileText, color: "bg-accent/20 text-accent-foreground" },
  ];

  return (
    <AppShell
      title="Tableau de bord"
      action={
        <Link to="/app/bulletins/new">
          <Button><Plus className="h-4 w-4 mr-1.5" />Nouveau bulletin</Button>
        </Link>
      }
    >
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`h-9 w-9 rounded-lg grid place-items-center ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">Bulletins récents</h2>
          <Link to="/app/bulletins" className="text-sm text-primary hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data?.recent.length ? (
          <ul className="divide-y divide-border">
            {data.recent.map((r: any) => (
              <li key={r.id}>
                <Link to="/app/bulletins/$id" params={{ id: r.id }} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{r.students?.first_name} {r.students?.last_name}</div>
                    <div className="text-sm text-muted-foreground">{r.classes?.name} · {r.term} {r.school_year}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif font-bold text-primary">{r.general_average ?? "—"}/20</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            Aucun bulletin pour le moment.
            <div className="mt-4">
              <Link to="/app/bulletins/new"><Button>Créer mon premier bulletin</Button></Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
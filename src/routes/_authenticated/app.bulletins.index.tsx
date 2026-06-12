import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mention } from "@/lib/grading";

export const Route = createFileRoute("/_authenticated/app/bulletins/")({
  component: BulletinsList,
});

function BulletinsList() {
  const { data: bulletins } = useQuery({
    queryKey: ["bulletins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_cards")
        .select("id, term, school_year, general_average, rank, class_size, created_at, students(first_name, last_name), classes(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell
      title="Bulletins"
      action={
        <Link to="/app/bulletins/new">
          <Button><Plus className="h-4 w-4 mr-1.5" />Nouveau bulletin</Button>
        </Link>
      }
    >
      {bulletins?.length ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Élève</th>
                <th className="p-3 font-medium hidden sm:table-cell">Classe</th>
                <th className="p-3 font-medium">Période</th>
                <th className="p-3 font-medium text-right">Moyenne</th>
                <th className="p-3 font-medium hidden md:table-cell">Mention</th>
                <th className="p-3 font-medium text-right">Rang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bulletins.map((b: any) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <Link to="/app/bulletins/$id" params={{ id: b.id }} className="font-medium text-primary hover:underline">
                      {b.students?.last_name?.toUpperCase()} {b.students?.first_name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{b.classes?.name}</td>
                  <td className="p-3">{b.term} {b.school_year}</td>
                  <td className="p-3 text-right font-serif font-bold text-primary">{b.general_average ?? "—"}/20</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{mention(b.general_average)}</td>
                  <td className="p-3 text-right">{b.rank ? `${b.rank}${b.class_size ? ` / ${b.class_size}` : ""}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="mt-4 font-serif text-xl font-bold">Aucun bulletin</h3>
          <p className="mt-1 text-muted-foreground">Créez votre premier bulletin scolaire.</p>
          <Link to="/app/bulletins/new"><Button className="mt-6"><Plus className="h-4 w-4 mr-1.5" />Nouveau bulletin</Button></Link>
        </div>
      )}
    </AppShell>
  );
}
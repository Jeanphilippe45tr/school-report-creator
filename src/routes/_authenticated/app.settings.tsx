import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user!;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data ?? { id: user.id };
    },
  });

  const [form, setForm] = useState<any>({});
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("profiles").upsert({ ...form, id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Informations enregistrées"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p: any) => ({ ...p, [k]: e.target.value }));

  return (
    <AppShell
      title="Établissement"
      action={<Button onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
        Enregistrer
      </Button>}
    >
      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-bold mb-4">Identité</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Prénom</Label><Input value={form.first_name ?? ""} onChange={set("first_name")} /></div>
            <div><Label>Nom</Label><Input value={form.last_name ?? ""} onChange={set("last_name")} /></div>
            <div className="sm:col-span-2"><Label>Fonction</Label><Input value={form.role_at_school ?? ""} onChange={set("role_at_school")} placeholder="Enseignant, Directeur…" /></div>
            <div className="sm:col-span-2"><Label>Téléphone</Label><Input value={form.phone ?? ""} onChange={set("phone")} /></div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-bold mb-4">Établissement</h2>
          <p className="text-sm text-muted-foreground mb-4">Ces informations apparaissent en en-tête des bulletins PDF.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Nom de l'établissement</Label><Input value={form.school_name ?? ""} onChange={set("school_name")} /></div>
            <div className="sm:col-span-2"><Label>Adresse</Label><Input value={form.school_address ?? ""} onChange={set("school_address")} /></div>
            <div><Label>Ville</Label><Input value={form.city ?? ""} onChange={set("city")} /></div>
            <div><Label>Pays</Label><Input value={form.country ?? ""} onChange={set("country")} /></div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
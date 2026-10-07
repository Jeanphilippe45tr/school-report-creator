import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash2, Wallet, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ClassPicker } from "@/components/class-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, fcfa, uid, useStudents, fullName } from "@/lib/school-data";

export const Route = createFileRoute("/_authenticated/app/finances")({
  head: () => ({ meta: [{ title: "Finances — CampusManager" }] }),
  component: Finances,
});

const DEFAULT_FEES = ["Inscription", "1re tranche", "2e tranche", "3e tranche"];

function Finances() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const { data: students } = useStudents(classId);
  const { data: fees } = useQuery({
    queryKey: ["fees", classId], enabled: !!classId,
    queryFn: async () => (await db.from("fee_items").select("*").eq("class_id", classId).order("position")).data ?? [],
  });
  const { data: payments } = useQuery({
    queryKey: ["payments", classId], enabled: !!classId,
    queryFn: async () => (await db.from("payments").select("*").eq("class_id", classId).order("paid_on", { ascending: false })).data ?? [],
  });
  const { data: summary } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: async () => {
      const [p, e] = await Promise.all([db.from("payments").select("amount"), db.from("expenses").select("amount")]);
      const sum = (r: any) => (r.data ?? []).reduce((s: number, x: any) => s + Number(x.amount), 0);
      return { income: sum(p), expenses: sum(e) };
    },
  });
  const refresh = () => qc.invalidateQueries({ predicate: (q) => ["fees", "payments", "finance-summary", "expenses"].includes(q.queryKey[0] as string) });

  const totalDue = (fees ?? []).reduce((s: number, f: any) => s + Number(f.amount), 0);
  const paidBy = useMemo(() => {
    const m = new Map<string, number>();
    (payments ?? []).forEach((p: any) => m.set(p.student_id, (m.get(p.student_id) ?? 0) + Number(p.amount)));
    return m;
  }, [payments]);
  const outstanding = (students ?? []).reduce((s: number, st: any) => s + Math.max(0, totalDue - (paidBy.get(st.id) ?? 0)), 0);

  return (
    <AppShell title="Finances">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat icon={TrendingUp} label="Total encaissé" value={fcfa(summary?.income)} />
        <Stat icon={TrendingDown} label="Total des dépenses" value={fcfa(summary?.expenses)} />
        <Stat icon={Wallet} label="Solde de caisse" value={fcfa((summary?.income ?? 0) - (summary?.expenses ?? 0))} />
      </div>

      <Tabs defaultValue="scolarite">
        <TabsList><TabsTrigger value="scolarite">Scolarité par classe</TabsTrigger><TabsTrigger value="depenses">Dépenses</TabsTrigger></TabsList>

        <TabsContent value="scolarite" className="space-y-6 mt-4">
          <ClassPicker value={classId} onChange={setClassId} />
          {classId && (
            <>
              <FeeEditor classId={classId} fees={fees ?? []} onChange={refresh} />
              <section className="rounded-xl border border-border bg-card overflow-x-auto">
                <div className="px-5 py-3 border-b border-border flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium">Situation des élèves · Total annuel {fcfa(totalDue)}</span>
                  <span className="text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" />Reste à recouvrer : {fcfa(outstanding)}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left"><tr><th className="p-3">Élève</th><th className="p-3">Payé</th><th className="p-3">Reste</th><th className="p-3">Statut</th><th className="p-3">Nouveau paiement</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {students?.map((s: any) => {
                      const paid = paidBy.get(s.id) ?? 0; const rest = Math.max(0, totalDue - paid);
                      return (
                        <tr key={s.id}>
                          <td className="p-3 font-medium">{fullName(s)}</td>
                          <td className="p-3">{fcfa(paid)}</td>
                          <td className="p-3">{fcfa(rest)}</td>
                          <td className="p-3">{totalDue === 0 ? "—" : rest === 0 ? <span className="text-primary font-medium">Soldé</span> : paid > 0 ? <span className="text-gold font-medium">Partiel</span> : <span className="text-destructive">Non payé</span>}</td>
                          <td className="p-2"><PaymentForm student={s} classId={classId} fees={fees ?? []} onDone={refresh} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
              <PaymentHistory payments={payments ?? []} students={students ?? []} fees={fees ?? []} onChange={refresh} />
            </>
          )}
        </TabsContent>

        <TabsContent value="depenses" className="mt-4"><Expenses onChange={refresh} /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{label}<Icon className="h-4 w-4 text-primary" /></div>
      <div className="mt-2 font-serif text-2xl font-bold">{value}</div>
    </div>
  );
}

function FeeEditor({ classId, fees, onChange }: { classId: string; fees: any[]; onChange: () => void }) {
  const [name, setName] = useState(""); const [amount, setAmount] = useState(""); const [due, setDue] = useState("");
  async function add(n = name, a = amount) {
    if (!n || !a) return;
    const { error } = await db.from("fee_items").insert({ owner_id: await uid(), class_id: classId, name: n, amount: Number(a), due_date: due || null, position: fees.length });
    if (error) return toast.error(error.message);
    setName(""); setAmount(""); setDue(""); onChange();
  }
  async function del(id: string) { await db.from("fee_items").delete().eq("id", id); onChange(); }
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-serif text-lg font-bold mb-3">Frais de scolarité de la classe</h2>
      {fees.length === 0 && <p className="text-sm text-muted-foreground mb-3">Ajoutez les tranches (ex. {DEFAULT_FEES.join(", ")}).</p>}
      <ul className="divide-y divide-border mb-4">
        {fees.map((f) => (
          <li key={f.id} className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium">{f.name}{f.due_date && <span className="text-muted-foreground font-normal"> · échéance {f.due_date}</span>}</span>
            <span className="flex items-center gap-3">{fcfa(f.amount)}<Button size="icon" variant="ghost" onClick={() => del(f.id)}><Trash2 className="h-4 w-4" /></Button></span>
          </li>
        ))}
      </ul>
      <div className="grid sm:grid-cols-4 gap-2 items-end">
        <div><Label>Libellé</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={DEFAULT_FEES[Math.min(fees.length, 3)]} /></div>
        <div><Label>Montant (FCFA)</Label><Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div><Label>Échéance</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        <Button onClick={() => add()}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
      </div>
    </section>
  );
}

function PaymentForm({ student, classId, fees, onDone }: any) {
  const [amount, setAmount] = useState(""); const [fee, setFee] = useState("");
  async function pay() {
    if (!amount || Number(amount) <= 0) return;
    const { error } = await db.from("payments").insert({ owner_id: await uid(), student_id: student.id, class_id: classId, fee_item_id: fee || null, amount: Number(amount), method: "Espèces" });
    if (error) return toast.error(error.message);
    toast.success(`Paiement de ${fcfa(Number(amount))} enregistré`); setAmount(""); onDone();
  }
  return (
    <div className="flex gap-2 min-w-80">
      <Select value={fee} onValueChange={setFee}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Tranche" /></SelectTrigger>
        <SelectContent>{fees.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
      </Select>
      <Input type="number" min="0" placeholder="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28" />
      <Button size="sm" variant="outline" onClick={pay}>Encaisser</Button>
    </div>
  );
}

function PaymentHistory({ payments, students, fees, onChange }: any) {
  if (!payments.length) return null;
  const st = new Map(students.map((s: any) => [s.id, s])); const fe = new Map(fees.map((f: any) => [f.id, f.name]));
  async function del(id: string) { if (!confirm("Supprimer ce paiement ?")) return; await db.from("payments").delete().eq("id", id); onChange(); }
  return (
    <section className="rounded-xl border border-border bg-card overflow-x-auto">
      <h2 className="font-serif text-lg font-bold px-5 py-3 border-b border-border">Historique des paiements</h2>
      <table className="w-full text-sm"><tbody className="divide-y divide-border">
        {payments.map((p: any) => (
          <tr key={p.id}><td className="p-3 text-muted-foreground">{p.paid_on}</td><td className="p-3">{fullName(st.get(p.student_id))}</td><td className="p-3">{(fe.get(p.fee_item_id) as string) ?? "—"}</td><td className="p-3 font-medium">{fcfa(p.amount)}</td>
            <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>
        ))}
      </tbody></table>
    </section>
  );
}

const CATS = ["Salaires", "Fournitures", "Entretien", "Électricité / eau", "Transport", "Autre"];
function Expenses({ onChange }: { onChange: () => void }) {
  const qc = useQueryClient();
  const { data: list } = useQuery({ queryKey: ["expenses"], queryFn: async () => (await db.from("expenses").select("*").order("spent_on", { ascending: false })).data ?? [] });
  const [f, setF] = useState({ label: "", category: "Autre", amount: "", spent_on: new Date().toISOString().slice(0, 10) });
  async function add() {
    if (!f.label || !f.amount) return toast.error("Libellé et montant requis");
    const { error } = await db.from("expenses").insert({ ...f, amount: Number(f.amount), owner_id: await uid() });
    if (error) return toast.error(error.message);
    setF({ ...f, label: "", amount: "" }); qc.invalidateQueries({ queryKey: ["expenses"] }); onChange();
  }
  async function del(id: string) { await db.from("expenses").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["expenses"] }); onChange(); }
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 grid sm:grid-cols-5 gap-2 items-end">
        <div className="sm:col-span-2"><Label>Libellé</Label><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></div>
        <div><Label>Catégorie</Label><Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Montant</Label><Input type="number" min="0" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
      </section>
      <section className="rounded-xl border border-border bg-card overflow-x-auto">
        {list?.length ? <table className="w-full text-sm"><tbody className="divide-y divide-border">
          {list.map((e: any) => <tr key={e.id}><td className="p-3 text-muted-foreground">{e.spent_on}</td><td className="p-3 font-medium">{e.label}</td><td className="p-3">{e.category}</td><td className="p-3">{fcfa(e.amount)}</td><td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => del(e.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}
        </tbody></table> : <p className="p-6 text-sm text-muted-foreground">Aucune dépense enregistrée.</p>}
      </section>
    </div>
  );
}

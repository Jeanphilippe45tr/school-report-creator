import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ScanLine, Loader2, Trash2, FileCheck2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { scanBulletinTemplate } from "@/lib/template-scan.functions";
import { normalizeTemplate } from "@/lib/bulletin-template";
import { TemplateManualEditor } from "./template-manual-editor";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function toBase64(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function TemplateScanCard({ profile }: { profile: any }) {
  const qc = useQueryClient();
  const scan = useServerFn(scanBulletinTemplate);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"manual" | "scan">("manual");
  const tpl = normalizeTemplate(profile?.bulletin_template);

  async function onFile(file?: File) {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return toast.error("Formats acceptés : JPG, PNG, WEBP ou PDF.");
    if (file.size > 10 * 1024 * 1024) return toast.error("Fichier trop lourd (10 Mo max).");
    setBusy(true);
    try {
      const base64 = await toBase64(file);
      await scan({ data: { fileName: file.name, mimeType: file.type as any, base64 } });
      toast.success("Modèle de bulletin importé !");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e: any) {
      toast.error(e?.message || "Analyse impossible.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function reset() {
    const user = (await supabase.auth.getUser()).data.user!;
    const { error } = await supabase.from("profiles").update({ bulletin_template: null }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Modèle par défaut rétabli");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-bold mb-1">Modèle de bulletin</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Choisissez votre format : décrivez-le vous-même gratuitement, ou laissez l'IA lire un scan de votre bulletin habituel.
      </p>

      {tpl && (
        <div className="mb-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm space-y-2">
          <div className="flex items-center gap-2 font-medium"><FileCheck2 className="h-4 w-4 text-primary" /> Modèle actif : {tpl.title}</div>
          {tpl.header_lines.length > 0 && <div className="text-muted-foreground">{tpl.header_lines.join(" · ")}</div>}
          <div className="flex flex-wrap gap-1.5">
            {tpl.columns.map((c) => <span key={c.key} className="rounded bg-primary text-primary-foreground px-2 py-0.5 text-xs">{c.label}</span>)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Couleurs :
            <span className="h-4 w-4 rounded border border-border" style={{ background: tpl.primary_color }} />
            <span className="h-4 w-4 rounded border border-border" style={{ background: tpl.accent_color }} />
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-5 rounded-lg border border-border p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <PenLine className="h-4 w-4" /> Manuel — gratuit
        </button>
        <button
          type="button"
          onClick={() => setMode("scan")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "scan" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ScanLine className="h-4 w-4" /> Scan IA — ~0,1 crédit
        </button>
      </div>

      {mode === "scan" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Scannez ou photographiez votre bulletin (photo ou PDF). L'IA reproduit son format — en-tête, colonnes, couleurs, signatures — pour tous vos exports.
          </p>
          <input ref={input} type="file" accept={ACCEPT.join(",")} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => input.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ScanLine className="h-4 w-4 mr-1.5" />}
              {busy ? "Analyse en cours…" : tpl ? "Importer un autre scan" : "Importer un scan de bulletin"}
            </Button>
            {tpl && <Button variant="outline" onClick={reset} disabled={busy}><Trash2 className="h-4 w-4 mr-1.5" />Modèle par défaut</Button>}
          </div>
        </div>
      ) : (
        <TemplateManualEditor current={tpl} onSaved={() => setMode("manual")} />
      )}
    </section>
  );
}

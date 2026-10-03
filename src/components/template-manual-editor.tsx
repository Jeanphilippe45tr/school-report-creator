import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PenLine, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { COLUMN_KEYS, ColumnKey, BulletinTemplate, normalizeTemplate } from "@/lib/bulletin-template";

const DEFAULT_LABELS: Record<ColumnKey, string> = {
  subject: "Matière",
  coefficient: "Coef.",
  score: "Note /20",
  total: "Total",
  rank: "Rang",
  appreciation: "Appréciation",
  teacher: "Enseignant",
};

const toLines = (arr: string[]) => arr.join("\n");
const fromLines = (s: string, max: number) =>
  s.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, max);

type ColumnState = { key: ColumnKey; label: string; enabled: boolean };

export function TemplateManualEditor({ current, onSaved }: { current: BulletinTemplate | null; onSaved: () => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(current?.title ?? "BULLETIN DE NOTES");
  const [subtitle, setSubtitle] = useState(current?.subtitle ?? "");
  const [headerLines, setHeaderLines] = useState(toLines(current?.header_lines ?? []));
  const [headerStyle, setHeaderStyle] = useState(current?.header_style ?? "banner");
  const [primaryColor, setPrimaryColor] = useState(current?.primary_color ?? "#2d503c");
  const [accentColor, setAccentColor] = useState(current?.accent_color ?? "#e8b84a");
  const [columns, setColumns] = useState<ColumnState[]>(() => {
    const active = new Map((current?.columns ?? []).map((c) => [c.key, c.label]));
    return COLUMN_KEYS.map((key) => ({
      key,
      label: active.get(key) ?? DEFAULT_LABELS[key],
      enabled: active.has(key),
    }));
  });
  const [showSummary, setShowSummary] = useState(current?.show_summary ?? true);
  const [commentTitles, setCommentTitles] = useState(toLines(current?.comment_titles ?? ["Appréciation du maître", "Visa du parent"]));
  const [signatureLabels, setSignatureLabels] = useState(toLines(current?.signature_labels ?? ["Le Directeur", "L'Enseignant"]));
  const [footerNote, setFooterNote] = useState(current?.footer_note ?? "");

  async function save() {
    setBusy(true);
    try {
      const payload = normalizeTemplate({
        title,
        subtitle: subtitle.trim() || null,
        header_lines: fromLines(headerLines, 5),
        header_style: headerStyle,
        primary_color: primaryColor,
        accent_color: accentColor,
        columns: columns.filter((c) => c.enabled).map((c) => ({ key: c.key, label: c.label })),
        show_summary: showSummary,
        comment_titles: fromLines(commentTitles, 3),
        signature_labels: fromLines(signatureLabels, 3),
        footer_note: footerNote.trim() || null,
      });
      const user = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("profiles").update({ bulletin_template: payload as any }).eq("id", user.id);
      if (error) throw new Error(error.message);
      toast.success("Modèle enregistré — vos bulletins PDF l'utilisent dès maintenant.");
      qc.invalidateQueries({ queryKey: ["profile"] });
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tpl-title">Titre du bulletin</Label>
          <Input id="tpl-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="BULLETIN DE NOTES" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpl-subtitle">Sous-titre (optionnel)</Label>
          <Input id="tpl-subtitle" value={subtitle} maxLength={120} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ex. Trimestre 1 — Année 2025/2026" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpl-header">En-tête officiel (une ligne par ligne, 5 max)</Label>
        <Textarea
          id="tpl-header"
          value={headerLines}
          rows={4}
          onChange={(e) => setHeaderLines(e.target.value)}
          placeholder={"Ex.:\nRépublique du Cameroun\nPaix – Travail – Patrie\nMinistère des Enseignements Secondaires"}
        />
        <p className="text-xs text-muted-foreground">Copiez-collez tel quel le texte d'en-tête de votre bulletin habituel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Style d'en-tête</Label>
          <Select value={headerStyle} onValueChange={(v) => setHeaderStyle(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Bandeau coloré</SelectItem>
              <SelectItem value="centered">Centré</SelectItem>
              <SelectItem value="left">Aligné à gauche</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpl-primary">Couleur principale</Label>
          <div className="flex items-center gap-2">
            <input id="tpl-primary" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-10 cursor-pointer rounded border border-border bg-card" />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} maxLength={7} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpl-accent">Couleur d'accent</Label>
          <div className="flex items-center gap-2">
            <input id="tpl-accent" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-9 w-10 cursor-pointer rounded border border-border bg-card" />
            <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} maxLength={7} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Colonnes du tableau des notes</Label>
        <div className="rounded-lg border border-border divide-y divide-border">
          {columns.map((col, i) => (
            <div key={col.key} className="flex items-center gap-3 px-3 py-2">
              <Checkbox
                checked={col.enabled}
                onCheckedChange={(v) => setColumns((cs) => cs.map((c, j) => (j === i ? { ...c, enabled: v === true } : c)))}
                aria-label={`Afficher la colonne ${col.label}`}
              />
              <Input
                value={col.label}
                maxLength={40}
                onChange={(e) => setColumns((cs) => cs.map((c, j) => (j === i ? { ...c, label: e.target.value } : c)))}
                className="h-8 flex-1"
                disabled={!col.enabled}
                placeholder={DEFAULT_LABELS[col.key]}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="tpl-summary" checked={showSummary} onCheckedChange={(v) => setShowSummary(v === true)} />
        <Label htmlFor="tpl-summary" className="font-normal">Afficher le récapitulatif (moyenne, mention, rang)</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tpl-comments">Titres des appréciations (une par ligne, 3 max)</Label>
          <Textarea id="tpl-comments" value={commentTitles} rows={2} onChange={(e) => setCommentTitles(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpl-signatures">Signatures (une par ligne, 3 max)</Label>
          <Textarea id="tpl-signatures" value={signatureLabels} rows={2} onChange={(e) => setSignatureLabels(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpl-footer">Note de bas de page (optionnel)</Label>
        <Input id="tpl-footer" value={footerNote} maxLength={160} onChange={(e) => setFooterNote(e.target.value)} placeholder="Ex. Bulletin non validé sans le cachet de l'école" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          Enregistrer le modèle
        </Button>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <PenLine className="h-3 w-3" /> 100 % gratuit — aucun crédit IA consommé
        </span>
      </div>
    </div>
  );
}

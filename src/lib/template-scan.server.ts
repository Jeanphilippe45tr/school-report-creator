import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { normalizeTemplate } from "./bulletin-template";

const schema = z.object({
  title: z.string(),
  subtitle: z.string().nullable(),
  header_lines: z.array(z.string()),
  header_style: z.enum(["banner", "centered", "left"]),
  primary_color: z.string(),
  accent_color: z.string(),
  columns: z.array(z.object({
    key: z.enum(["subject", "coefficient", "score", "total", "rank", "appreciation", "teacher"]),
    label: z.string(),
  })),
  show_summary: z.boolean(),
  comment_titles: z.array(z.string()),
  signature_labels: z.array(z.string()),
  footer_note: z.string().nullable(),
});

const PROMPT = `Tu analyses le scan d'un bulletin scolaire (souvent d'Afrique francophone). Extrais son FORMAT pour le reproduire, pas les données d'un élève.
- title: titre principal (ex: "BULLETIN DE NOTES DU 1er TRIMESTRE" -> "BULLETIN DE NOTES").
- subtitle: devise ou mention sous le titre, sinon null.
- header_lines: lignes d'en-tête officielles (ex: "RÉPUBLIQUE DU CAMEROUN", "Paix - Travail - Patrie", "MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES"), 5 max, sans le nom de l'élève.
- header_style: "centered" si l'en-tête est centré, "left" si aligné à gauche, "banner" si bandeau coloré.
- primary_color / accent_color: couleurs dominantes en hex #rrggbb (noir #222222 si le document est en noir et blanc).
- columns: colonnes du tableau des notes dans l'ordre, avec le libellé exact du document, mappées sur les clés disponibles (ignore les colonnes sans équivalent). 7 max.
- show_summary: true si un encadré moyenne/rang/mention existe.
- comment_titles: titres des zones d'appréciation (3 max).
- signature_labels: libellés des signatures (3 max).
- footer_note: mention de bas de page, sinon null.`;

export async function analyzeTemplate(input: { mimeType: string; fileName: string; base64: string }) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Service d'analyse non configuré.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const filePart = input.mimeType === "application/pdf"
    ? ({ type: "file", filename: input.fileName, data: input.base64, mediaType: "application/pdf" } as const)
    : ({ type: "image", image: new URL(`data:${input.mimeType};base64,${input.base64}`) } as const);

  let streamError: unknown = null;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    output: Output.object({ schema }),
    messages: [{ role: "user", content: [{ type: "text", text: PROMPT }, filePart as any] }],
    onError: ({ error }) => { streamError = error; },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    const out = await result.output;
    return normalizeTemplate(out)!;
  } catch (e) {
    const err: any = streamError ?? e;
    const status = err?.statusCode ?? err?.status;
    if (status === 402) throw new Error("Crédits IA épuisés. Rechargez vos crédits pour analyser un scan.");
    if (status === 429) throw new Error("Trop de demandes, réessayez dans un instant.");
    if (NoObjectGeneratedError.isInstance(e)) throw new Error("Le document n'a pas pu être interprété comme un bulletin.");
    throw new Error(err?.message || "Analyse impossible.");
  }
}

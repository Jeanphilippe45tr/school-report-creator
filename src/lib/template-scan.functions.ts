import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeTemplate } from "./template-scan.server";

export const scanBulletinTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      fileName: z.string().max(200),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
      base64: z.string().min(10).max(14_000_000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const template = await analyzeTemplate(data);
    const { error } = await context.supabase.from("profiles").update({ bulletin_template: template as any }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return template;
  });

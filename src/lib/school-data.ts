import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const db = supabase as any;

export const fcfa = (n: number | null | undefined) =>
  `${Math.round(Number(n ?? 0)).toLocaleString("fr-FR")} FCFA`;

export async function uid() {
  return (await supabase.auth.getUser()).data.user!.id;
}

export function useClasses() {
  return useQuery({ queryKey: ["classes"], queryFn: async () => (await supabase.from("classes").select("*").order("name")).data ?? [] });
}

export function useStudents(classId: string) {
  return useQuery({
    queryKey: ["students", classId], enabled: !!classId,
    queryFn: async () => (await supabase.from("students").select("*").eq("class_id", classId).order("last_name")).data ?? [],
  });
}

export const fullName = (s: any) => (s ? `${String(s.last_name).toUpperCase()} ${s.first_name}` : "—");

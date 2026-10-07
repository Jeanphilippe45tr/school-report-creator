import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses } from "@/lib/school-data";

export function ClassPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: classes } = useClasses();
  return (
    <div className="min-w-56">
      <Label>Classe</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
        <SelectContent>{classes?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.school_year})</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

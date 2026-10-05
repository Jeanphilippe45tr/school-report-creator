CREATE TABLE public.sequence_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  school_year text NOT NULL,
  sequence smallint NOT NULL CHECK (sequence BETWEEN 1 AND 6),
  score numeric CHECK (score IS NULL OR (score >= 0 AND score <= 20)),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, school_year, sequence)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sequence_grades TO authenticated;
GRANT ALL ON public.sequence_grades TO service_role;
ALTER TABLE public.sequence_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manage sequence_grades" ON public.sequence_grades FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX sequence_grades_class_year_idx ON public.sequence_grades (class_id, school_year);
CREATE TRIGGER trg_sequence_grades_updated BEFORE UPDATE ON public.sequence_grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
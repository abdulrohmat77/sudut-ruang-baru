CREATE TABLE public.phase_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_key TEXT NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'dokumen',
  status TEXT NOT NULL DEFAULT 'todo',
  required BOOLEAN NOT NULL DEFAULT true,
  due_date DATE,
  approved_at TIMESTAMPTZ,
  file_url TEXT,
  notes TEXT,
  sequence INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.phase_deliverables TO authenticated;
GRANT ALL ON public.phase_deliverables TO service_role;

ALTER TABLE public.phase_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage deliverables of their projects"
ON public.phase_deliverables FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = phase_deliverables.project_id AND p.created_by = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = phase_deliverables.project_id AND p.created_by = auth.uid()));

CREATE INDEX idx_phase_deliverables_project ON public.phase_deliverables(project_id, phase_key, sequence);

CREATE TRIGGER trg_phase_deliverables_updated_at
BEFORE UPDATE ON public.phase_deliverables
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
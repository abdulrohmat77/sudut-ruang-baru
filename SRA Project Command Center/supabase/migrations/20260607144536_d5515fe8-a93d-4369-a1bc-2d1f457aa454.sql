
-- Knowledge Base documents (SRA MD ingest)
CREATE TABLE public.kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  source text,
  token_estimate integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_documents TO authenticated;
GRANT ALL ON public.kb_documents TO service_role;
ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin kb" ON public.kb_documents FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER kb_documents_updated_at BEFORE UPDATE ON public.kb_documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Document templates (SRA Proposal / SPK / Invoice / BAST / MOM)
CREATE TABLE public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL, -- proposal | spk | invoice | bast | mom
  description text,
  body_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_templates TO authenticated;
GRANT ALL ON public.document_templates TO service_role;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin templates" ON public.document_templates FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER document_templates_updated_at BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Project phases following SRA SOP (Brief, Concept, DD, DED, Tender, Construction, BAST)
CREATE TABLE public.project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_key text NOT NULL, -- brief | concept | dd | ded | tender | construction | bast
  name text NOT NULL,
  sequence integer NOT NULL DEFAULT 0,
  status task_status NOT NULL DEFAULT 'not_started',
  weight numeric(5,2) NOT NULL DEFAULT 0,
  planned_start date,
  planned_end date,
  actual_start date,
  actual_end date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, phase_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_phases TO authenticated;
GRANT ALL ON public.project_phases TO service_role;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin phases" ON public.project_phases FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER project_phases_updated_at BEFORE UPDATE ON public.project_phases
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-seed SRA SOP phases when a new project is created
CREATE OR REPLACE FUNCTION public.seed_project_phases()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.project_phases (project_id, phase_key, name, sequence, weight) VALUES
    (NEW.id, 'brief',        '01 · Brief & Kick-Off',          1, 5),
    (NEW.id, 'concept',      '02 · Konsep Desain',             2, 15),
    (NEW.id, 'dd',           '03 · Design Development (DD)',   3, 20),
    (NEW.id, 'ded',          '04 · Detail Engineering Design', 4, 20),
    (NEW.id, 'tender',       '05 · Tender / Procurement',      5, 10),
    (NEW.id, 'construction', '06 · Konstruksi & Supervisi',    6, 25),
    (NEW.id, 'bast',         '07 · Closing & BAST',            7, 5);
  RETURN NEW;
END $$;
CREATE TRIGGER projects_seed_phases AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.seed_project_phases();

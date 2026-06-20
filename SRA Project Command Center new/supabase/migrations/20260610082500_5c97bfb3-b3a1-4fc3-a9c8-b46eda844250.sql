
-- 1. Correspondence: status + template + updated_at
ALTER TABLE public.correspondence
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS template_id uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS correspondence_updated_at ON public.correspondence;
CREATE TRIGGER correspondence_updated_at BEFORE UPDATE ON public.correspondence
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. Correspondence templates
CREATE TABLE IF NOT EXISTS public.correspondence_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  direction text NOT NULL DEFAULT 'out',
  subject_template text NOT NULL,
  body_template text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.correspondence_templates TO authenticated;
GRANT ALL ON public.correspondence_templates TO service_role;
ALTER TABLE public.correspondence_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admin templates" ON public.correspondence_templates;
CREATE POLICY "Super admin templates" ON public.correspondence_templates
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
DROP POLICY IF EXISTS "Authenticated read templates" ON public.correspondence_templates;
CREATE POLICY "Authenticated read templates" ON public.correspondence_templates
  FOR SELECT TO authenticated USING (true);
DROP TRIGGER IF EXISTS correspondence_templates_updated_at ON public.correspondence_templates;
CREATE TRIGGER correspondence_templates_updated_at BEFORE UPDATE ON public.correspondence_templates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.correspondence
  DROP CONSTRAINT IF EXISTS correspondence_template_fk;
ALTER TABLE public.correspondence
  ADD CONSTRAINT correspondence_template_fk
  FOREIGN KEY (template_id) REFERENCES public.correspondence_templates(id) ON DELETE SET NULL;

-- 3. Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admin reads audit" ON public.audit_logs;
CREATE POLICY "Super admin reads audit" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_super_admin() OR actor_id = auth.uid());
DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_logs;
CREATE POLICY "Authenticated insert audit" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs(actor_id);

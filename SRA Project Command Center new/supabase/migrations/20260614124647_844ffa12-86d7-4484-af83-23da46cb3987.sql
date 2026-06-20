
-- 1) Tighten projects SELECT: drop blanket read, restrict to creator or super admin
DROP POLICY IF EXISTS "Authenticated read projects" ON public.projects;

CREATE POLICY "Creator or admin read projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR public.is_super_admin());

-- 2) Safe directory function: all authenticated users can list projects without owner contacts
CREATE OR REPLACE FUNCTION public.list_projects_directory()
RETURNS TABLE (
  id uuid,
  code text,
  name text,
  client_name text,
  location text,
  description text,
  status text,
  progress_percent numeric,
  contract_value numeric,
  start_date date,
  end_date date,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.code, p.name, p.client_name, p.location, p.description,
         p.status, p.progress_percent, p.contract_value,
         p.start_date, p.end_date, p.created_at, p.updated_at, p.created_by
  FROM public.projects p
  ORDER BY p.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.list_projects_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_projects_directory() TO authenticated;

-- 3) Safe single-project function for dashboards (no owner contacts)
CREATE OR REPLACE FUNCTION public.get_project_safe(_id uuid)
RETURNS TABLE (
  id uuid,
  code text,
  name text,
  client_name text,
  location text,
  description text,
  status text,
  progress_percent numeric,
  contract_value numeric,
  start_date date,
  end_date date,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.code, p.name, p.client_name, p.location, p.description,
         p.status, p.progress_percent, p.contract_value,
         p.start_date, p.end_date, p.created_at, p.updated_at, p.created_by
  FROM public.projects p
  WHERE p.id = _id
$$;

REVOKE ALL ON FUNCTION public.get_project_safe(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_project_safe(uuid) TO authenticated;

-- 4) Tighten overflow_events INSERT: require auth.uid() = user_id (no NULL)
DROP POLICY IF EXISTS "authenticated logs overflow_events" ON public.overflow_events;

CREATE POLICY "authenticated logs overflow_events"
ON public.overflow_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

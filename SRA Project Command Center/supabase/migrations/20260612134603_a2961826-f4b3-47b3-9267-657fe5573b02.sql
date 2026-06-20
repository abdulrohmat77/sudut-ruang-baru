
-- Storage: scope reads and uploads to owner
DROP POLICY IF EXISTS "auth read attachments" ON storage.objects;
CREATE POLICY "auth read own attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'attachments'
  AND (owner = auth.uid() OR public.is_super_admin())
);

DROP POLICY IF EXISTS "auth upload attachments" ON storage.objects;
CREATE POLICY "auth upload own attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND owner = auth.uid()
);

-- monthly_reports
DROP POLICY IF EXISTS "Authenticated create monthly_reports" ON public.monthly_reports;
DROP POLICY IF EXISTS "Authenticated update monthly_reports" ON public.monthly_reports;
DROP POLICY IF EXISTS "Authenticated delete monthly_reports" ON public.monthly_reports;

CREATE POLICY "Authenticated create monthly_reports"
ON public.monthly_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Super admin update monthly_reports"
ON public.monthly_reports FOR UPDATE TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin delete monthly_reports"
ON public.monthly_reports FOR DELETE TO authenticated
USING (public.is_super_admin());

-- phase_deliverables
DROP POLICY IF EXISTS "Authenticated users manage deliverables" ON public.phase_deliverables;

CREATE POLICY "Authenticated read deliverables"
ON public.phase_deliverables FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated create deliverables"
ON public.phase_deliverables FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND (created_by IS NULL OR created_by = auth.uid()));

CREATE POLICY "Owner or super admin update deliverables"
ON public.phase_deliverables FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR public.is_super_admin())
WITH CHECK (created_by = auth.uid() OR public.is_super_admin());

CREATE POLICY "Super admin delete deliverables"
ON public.phase_deliverables FOR DELETE TO authenticated
USING (public.is_super_admin());

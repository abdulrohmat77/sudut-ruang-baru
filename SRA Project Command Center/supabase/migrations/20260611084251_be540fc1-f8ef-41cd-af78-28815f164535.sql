DROP POLICY IF EXISTS "Super admin daily reports" ON public.daily_reports;

CREATE POLICY "Authenticated read daily_reports" ON public.daily_reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated create daily_reports" ON public.daily_reports
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by IS NULL OR auth.uid() = submitted_by);

CREATE POLICY "Creator update daily_reports" ON public.daily_reports
  FOR UPDATE TO authenticated
  USING (auth.uid() = submitted_by OR public.is_super_admin())
  WITH CHECK (auth.uid() = submitted_by OR public.is_super_admin());

CREATE POLICY "Creator delete daily_reports" ON public.daily_reports
  FOR DELETE TO authenticated
  USING (auth.uid() = submitted_by OR public.is_super_admin());
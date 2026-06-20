DO $$ DECLARE r record; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='weekly_reports' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.weekly_reports', r.policyname); END LOOP; END $$;

CREATE POLICY "Authenticated read weekly_reports" ON public.weekly_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create weekly_reports" ON public.weekly_reports FOR INSERT TO authenticated WITH CHECK (submitted_by IS NULL OR auth.uid() = submitted_by);
CREATE POLICY "Creator update weekly_reports" ON public.weekly_reports FOR UPDATE TO authenticated USING (auth.uid() = submitted_by OR public.is_super_admin()) WITH CHECK (auth.uid() = submitted_by OR public.is_super_admin());
CREATE POLICY "Creator delete weekly_reports" ON public.weekly_reports FOR DELETE TO authenticated USING (auth.uid() = submitted_by OR public.is_super_admin());
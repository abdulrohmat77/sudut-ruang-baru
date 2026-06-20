DO $$ DECLARE r record; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='monthly_reports' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.monthly_reports', r.policyname); END LOOP; END $$;

CREATE POLICY "Authenticated read monthly_reports" ON public.monthly_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create monthly_reports" ON public.monthly_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update monthly_reports" ON public.monthly_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete monthly_reports" ON public.monthly_reports FOR DELETE TO authenticated USING (true);
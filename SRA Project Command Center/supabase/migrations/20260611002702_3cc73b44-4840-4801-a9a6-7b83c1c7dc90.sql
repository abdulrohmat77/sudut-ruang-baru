CREATE POLICY "Authenticated read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator update projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = created_by OR is_super_admin()) WITH CHECK (auth.uid() = created_by OR is_super_admin());
CREATE POLICY "Creator delete projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = created_by OR is_super_admin());
DROP POLICY IF EXISTS "Users manage deliverables of their projects" ON public.phase_deliverables;
CREATE POLICY "Authenticated users manage deliverables"
ON public.phase_deliverables FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
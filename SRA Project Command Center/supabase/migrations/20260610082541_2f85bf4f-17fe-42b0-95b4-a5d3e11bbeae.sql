
DROP POLICY IF EXISTS "auth read attachments" ON storage.objects;
CREATE POLICY "auth read attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "auth upload attachments" ON storage.objects;
CREATE POLICY "auth upload attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "auth update own attachments" ON storage.objects;
CREATE POLICY "auth update own attachments" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments' AND (owner = auth.uid() OR public.is_super_admin()));

DROP POLICY IF EXISTS "auth delete own attachments" ON storage.objects;
CREATE POLICY "auth delete own attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND (owner = auth.uid() OR public.is_super_admin()));

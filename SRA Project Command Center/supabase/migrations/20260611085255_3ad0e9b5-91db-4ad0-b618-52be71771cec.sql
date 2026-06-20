
-- 1) Owner contact on projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS owner_email text,
  ADD COLUMN IF NOT EXISTS owner_phone text;

-- 2) Notifications (per user)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own notifications read" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notifications update" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notifications delete" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "authenticated create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3) Overflow events (super-admin audit log)
CREATE TABLE IF NOT EXISTS public.overflow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  table_name text NOT NULL,
  field_name text,
  attempted_value text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS overflow_events_created_idx ON public.overflow_events(created_at DESC);

GRANT SELECT, INSERT ON public.overflow_events TO authenticated;
GRANT ALL ON public.overflow_events TO service_role;
ALTER TABLE public.overflow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin reads overflow_events" ON public.overflow_events
  FOR SELECT TO authenticated USING (public.is_super_admin());
CREATE POLICY "authenticated logs overflow_events" ON public.overflow_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

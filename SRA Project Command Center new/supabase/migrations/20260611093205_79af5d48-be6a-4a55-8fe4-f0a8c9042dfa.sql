
-- 1) org_settings singleton
CREATE TABLE public.org_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  fallback_owner_email text,
  fallback_owner_phone text,
  digest_hour_wib int NOT NULL DEFAULT 8 CHECK (digest_hour_wib BETWEEN 0 AND 23),
  digest_enabled boolean NOT NULL DEFAULT true,
  realtime_overflow_enabled boolean NOT NULL DEFAULT true,
  wa_from_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.org_settings TO authenticated;
GRANT ALL ON public.org_settings TO service_role;

ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin read org_settings" ON public.org_settings
  FOR SELECT TO authenticated USING (public.is_super_admin());
CREATE POLICY "Super admin insert org_settings" ON public.org_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());
CREATE POLICY "Super admin update org_settings" ON public.org_settings
  FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE TRIGGER trg_org_settings_updated BEFORE UPDATE ON public.org_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.org_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- 2) profiles.notification_prefs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 3) wa_send_log
CREATE TABLE public.wa_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  recipient_phone text NOT NULL,
  template_name text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wa_send_log TO authenticated;
GRANT ALL ON public.wa_send_log TO service_role;

ALTER TABLE public.wa_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin read wa_send_log" ON public.wa_send_log
  FOR SELECT TO authenticated USING (public.is_super_admin());

CREATE INDEX wa_send_log_created_at_idx ON public.wa_send_log (created_at DESC);

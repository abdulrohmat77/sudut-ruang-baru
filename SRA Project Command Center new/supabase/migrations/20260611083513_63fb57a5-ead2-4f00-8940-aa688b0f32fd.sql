DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT t, c FROM (VALUES
      ('projects','contract_value'),
      ('contracts','value'),
      ('invoices','amount'),
      ('invoices','tax_amount'),
      ('variation_orders','amount')
    ) AS x(t,c)
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
      r.t, r.t || '_' || r.c || '_monetary_range_chk');
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%I IS NULL OR (%I >= 0 AND %I <= 1e19))',
      r.t, r.t || '_' || r.c || '_monetary_range_chk', r.c, r.c, r.c);
  END LOOP;
END $$;
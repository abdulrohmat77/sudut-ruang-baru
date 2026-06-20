ALTER TABLE public.contracts ALTER COLUMN value TYPE numeric(22,2);
ALTER TABLE public.invoices ALTER COLUMN amount TYPE numeric(22,2);
ALTER TABLE public.invoices ALTER COLUMN tax_amount TYPE numeric(22,2);
ALTER TABLE public.variation_orders ALTER COLUMN amount TYPE numeric(22,2);
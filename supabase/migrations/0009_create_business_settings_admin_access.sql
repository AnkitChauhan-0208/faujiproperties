-- Business Information settings used by the admin Settings page.
-- This migration is safe to run when 0008 was not applied yet.
CREATE TABLE IF NOT EXISTS public.business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    whatsapp TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    maps_url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business settings admin read" ON public.business_settings;
CREATE POLICY "Business settings admin read"
ON public.business_settings
FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Business settings admin update" ON public.business_settings;
CREATE POLICY "Business settings admin update"
ON public.business_settings
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

INSERT INTO public.business_settings (id, name, phone, whatsapp, email, address, maps_url, description)
VALUES (
    'default',
    'Fauji Properties',
    '',
    '',
    'ajitsingh5624@gmail.com',
    'Jaggi Garden, Ambala, Haryana, India',
    '',
    'Trusted property guidance for homes, plots, and investments in Ambala and beyond.'
)
ON CONFLICT (id) DO NOTHING;
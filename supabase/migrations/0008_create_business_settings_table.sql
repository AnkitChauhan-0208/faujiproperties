CREATE TABLE public.business_settings (
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

-- Access is intentionally limited to the server-side authorized admin client.
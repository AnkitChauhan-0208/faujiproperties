-- Migration: Create properties table

CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL,
    price TEXT NOT NULL,
    price_lakhs NUMERIC NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    parking TEXT,
    status TEXT NOT NULL DEFAULT 'Available',
    featured BOOLEAN NOT NULL DEFAULT false,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow public users to SELECT (read) properties
CREATE POLICY "Allow public read access" 
ON public.properties 
FOR SELECT 
USING (true);

-- Allow authenticated users to INSERT, UPDATE, DELETE 
-- (Strict authorization will be enforced via Next.js Server Actions checking ADMIN_EMAIL)
CREATE POLICY "Allow authenticated full access" 
ON public.properties 
FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

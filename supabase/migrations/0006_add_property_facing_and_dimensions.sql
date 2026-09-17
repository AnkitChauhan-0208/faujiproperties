-- Optional property details for new and existing listings.
ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS facing TEXT,
    ADD COLUMN IF NOT EXISTS dimensions TEXT;

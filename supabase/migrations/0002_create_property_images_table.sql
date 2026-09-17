CREATE TABLE public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property_id
    ON public.property_images(property_id);

CREATE INDEX idx_property_images_display_order
    ON public.property_images(property_id, display_order);

ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to property images"
ON public.property_images
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated full access to property images"
ON public.property_images
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

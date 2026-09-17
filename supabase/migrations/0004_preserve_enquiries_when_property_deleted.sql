-- Keep historical enquiries when their property is removed.
ALTER TABLE public.enquiries
    DROP CONSTRAINT IF EXISTS enquiries_property_id_fkey;

ALTER TABLE public.enquiries
    ADD CONSTRAINT enquiries_property_id_fkey
    FOREIGN KEY (property_id)
    REFERENCES public.properties(id)
    ON DELETE SET NULL;
-- Admin server actions use the service-role client only after verifying ADMIN_EMAIL.
-- Keep the anon-key surface read-only for properties and insert-only for enquiries.
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated full access to property images" ON public.property_images;
DROP POLICY IF EXISTS "Allow authenticated enquiry reads" ON public.enquiries;
DROP POLICY IF EXISTS "Allow authenticated enquiry updates" ON public.enquiries;
DROP POLICY IF EXISTS "Allow authenticated enquiry deletes" ON public.enquiries;
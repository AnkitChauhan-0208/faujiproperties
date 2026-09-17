-- Server actions verify the configured admin email before issuing deletes.
CREATE POLICY "Allow authenticated enquiry deletes"
ON public.enquiries
FOR DELETE
USING (auth.uid() IS NOT NULL);
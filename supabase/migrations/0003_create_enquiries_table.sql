CREATE TABLE public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Interested', 'Closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enquiries_property_id ON public.enquiries(property_id);
CREATE INDEX idx_enquiries_status ON public.enquiries(status);
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public enquiry inserts" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated enquiry reads" ON public.enquiries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated enquiry updates" ON public.enquiries FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
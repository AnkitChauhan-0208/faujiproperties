ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.enquiries
ADD COLUMN IF NOT EXISTS notification_status TEXT NOT NULL DEFAULT 'pending'
CHECK (notification_status IN ('pending', 'sending', 'sent')),
ADD COLUMN IF NOT EXISTS notification_claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.claim_enquiry_notification(p_enquiry_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.enquiries
  SET notification_status = 'sending', notification_claimed_at = now()
  WHERE id = p_enquiry_id
    AND notification_sent_at IS NULL
    AND (
      notification_status = 'pending'
      OR (notification_status = 'sending' AND notification_claimed_at < now() - INTERVAL '10 minutes')
    );

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_enquiry_notification(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_enquiry_notification(UUID) TO service_role;

UPDATE public.business_settings
SET notification_enabled = true
WHERE id = 'default';

ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS admin_inactivity_timeout_minutes INTEGER NOT NULL DEFAULT 15
CHECK (admin_inactivity_timeout_minutes IN (5, 10, 15, 30));

UPDATE public.business_settings
SET admin_inactivity_timeout_minutes = 15
WHERE id = 'default'
  AND admin_inactivity_timeout_minutes IS NULL;
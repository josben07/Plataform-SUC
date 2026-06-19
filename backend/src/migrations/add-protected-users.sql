ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT FALSE;

UPDATE public.users
SET is_protected = FALSE
WHERE is_protected IS NULL;

-- Run this in Supabase Dashboard > SQL Editor
ALTER TABLE public.mentor_profiles
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT NULL;

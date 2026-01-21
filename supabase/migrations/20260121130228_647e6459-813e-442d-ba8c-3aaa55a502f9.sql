-- Add progress field to activities table (0-100%)
ALTER TABLE public.activities 
ADD COLUMN progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
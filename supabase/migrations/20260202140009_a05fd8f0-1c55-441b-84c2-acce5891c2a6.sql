-- Add notes column to activities table for rich text content
ALTER TABLE public.activities ADD COLUMN notes text DEFAULT NULL;
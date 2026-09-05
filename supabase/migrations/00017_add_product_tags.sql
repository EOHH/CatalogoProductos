-- Add tags array column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Update the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';

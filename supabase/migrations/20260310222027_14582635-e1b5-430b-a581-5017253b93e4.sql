
-- Add slug column to churches table
ALTER TABLE public.churches ADD COLUMN slug text UNIQUE;

-- Generate slugs for existing churches
UPDATE public.churches 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || LEFT(id::text, 6);

-- Create index for fast slug lookups
CREATE INDEX idx_churches_slug ON public.churches(slug);

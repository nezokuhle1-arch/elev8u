ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS portfolio_links jsonb DEFAULT '[]'::jsonb;

-- RLS already covers this column since it's on the existing table

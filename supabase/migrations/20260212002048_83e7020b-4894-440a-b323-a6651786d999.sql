
CREATE TABLE public.banned_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('email', 'accountId')),
  value TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banned_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read bans (needed for public form to check if user is banned)
CREATE POLICY "Anyone can read banned entries"
  ON public.banned_entries FOR SELECT
  USING (true);

-- Only authenticated users can manage bans
CREATE POLICY "Authenticated users can insert banned entries"
  ON public.banned_entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete banned entries"
  ON public.banned_entries FOR DELETE
  USING (auth.uid() IS NOT NULL);

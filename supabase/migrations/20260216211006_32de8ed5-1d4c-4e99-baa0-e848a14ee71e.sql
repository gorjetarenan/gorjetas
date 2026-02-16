
-- Table to store validated player IDs received via postback
CREATE TABLE public.validated_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL UNIQUE,
  currency TEXT,
  registration_date TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.validated_players ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for form validation)
CREATE POLICY "Anyone can read validated players"
  ON public.validated_players FOR SELECT USING (true);

-- Edge function inserts via service role, no INSERT policy for anon needed
-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage validated players"
  ON public.validated_players FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

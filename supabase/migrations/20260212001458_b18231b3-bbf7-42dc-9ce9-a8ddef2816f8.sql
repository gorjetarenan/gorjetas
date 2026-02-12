
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can insert submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read (admin panel)
CREATE POLICY "Authenticated users can read submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete submissions"
  ON public.submissions FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE TABLE public.raffle_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.raffle_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read wins"
  ON public.raffle_wins FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert wins"
  ON public.raffle_wins FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete wins"
  ON public.raffle_wins FOR DELETE
  USING (auth.uid() IS NOT NULL);

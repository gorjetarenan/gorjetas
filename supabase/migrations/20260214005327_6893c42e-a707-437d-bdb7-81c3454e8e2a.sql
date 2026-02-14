
DROP POLICY "Anyone can insert submissions" ON public.submissions;
CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

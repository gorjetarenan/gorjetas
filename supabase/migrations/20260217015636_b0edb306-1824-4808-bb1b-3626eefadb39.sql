CREATE POLICY "Authenticated users can update wins"
ON public.raffle_wins
FOR UPDATE
USING (auth.uid() IS NOT NULL);
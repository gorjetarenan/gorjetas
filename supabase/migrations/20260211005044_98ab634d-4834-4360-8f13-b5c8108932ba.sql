
-- Create page_config table to store all configuration
CREATE TABLE public.page_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read config (public page needs it)
CREATE POLICY "Anyone can read config"
  ON public.page_config FOR SELECT
  USING (true);

-- Only authenticated users can update config
CREATE POLICY "Authenticated users can update config"
  ON public.page_config FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert config"
  ON public.page_config FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for background images
INSERT INTO storage.buckets (id, name, public) VALUES ('backgrounds', 'backgrounds', true);

-- Storage policies
CREATE POLICY "Anyone can view backgrounds"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'backgrounds');

CREATE POLICY "Authenticated users can upload backgrounds"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'backgrounds' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update backgrounds"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'backgrounds' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete backgrounds"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'backgrounds' AND auth.uid() IS NOT NULL);


CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Uploaded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO anon, authenticated;
GRANT ALL ON public.documents TO service_role;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert documents" ON public.documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read documents" ON public.documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete documents" ON public.documents FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX documents_session_idx ON public.documents (session_id, created_at DESC);

-- Storage policies for pdf-documents bucket
CREATE POLICY "Anyone can upload pdf-documents"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'pdf-documents');

CREATE POLICY "Anyone can read pdf-documents"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'pdf-documents');

CREATE POLICY "Anyone can delete pdf-documents"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'pdf-documents');

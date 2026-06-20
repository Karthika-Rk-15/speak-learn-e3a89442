
CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'intermediate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.chat_history TO anon, authenticated;
GRANT ALL ON public.chat_history TO service_role;

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat history"
  ON public.chat_history FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat history"
  ON public.chat_history FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete their own chat history rows"
  ON public.chat_history FOR DELETE TO anon, authenticated
  USING (true);

CREATE INDEX chat_history_session_idx ON public.chat_history(session_id, created_at DESC);

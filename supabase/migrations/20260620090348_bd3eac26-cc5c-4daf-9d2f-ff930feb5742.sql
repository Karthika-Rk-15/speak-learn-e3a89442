
DROP POLICY IF EXISTS "Anyone can insert chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Anyone can delete their own chat history rows" ON public.chat_history;

REVOKE DELETE ON public.chat_history FROM anon, authenticated;

CREATE POLICY "Insert with session id"
  ON public.chat_history FOR INSERT TO anon, authenticated
  WITH CHECK (length(session_id) > 8 AND length(question) > 0 AND length(answer) > 0);

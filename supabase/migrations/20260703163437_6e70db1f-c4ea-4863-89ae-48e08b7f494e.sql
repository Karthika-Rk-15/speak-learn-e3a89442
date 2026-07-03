
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  title text NOT NULL DEFAULT 'Quiz',
  num_questions integer NOT NULL DEFAULT 5,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO anon, authenticated;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quizzes" ON public.quizzes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert quizzes" ON public.quizzes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete quizzes" ON public.quizzes FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts TO anon, authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quiz attempts" ON public.quiz_attempts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert quiz attempts" ON public.quiz_attempts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX quizzes_session_idx ON public.quizzes(session_id, created_at DESC);
CREATE INDEX quiz_attempts_quiz_idx ON public.quiz_attempts(quiz_id, created_at DESC);

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, ArrowRight, RotateCcw, Sparkles, CheckCircle2, XCircle, Loader2, FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, RadialBar, RadialBarChart, PolarAngleAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard/quiz")({
  component: QuizPage,
});

type Stage = "setup" | "playing" | "results";
type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  page: number;
  source: string;
};
type Quiz = {
  id: string;
  title: string;
  num_questions: number;
  questions: Question[];
};

function getSessionId() {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem("learnmate_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("learnmate_session_id", id);
  }
  return id;
}

function QuizPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [numQuestions, setNumQuestions] = useState<5 | 10 | 20>(5);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function generate() {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          numQuestions,
          difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      setQuiz(data.quiz);
      setAnswers([]);
      setIdx(0);
      setSelected(null);
      setStage("playing");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  }

  async function next() {
    if (selected === null || !quiz) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (idx + 1 >= quiz.questions.length) {
      // submit attempt
      setSubmitting(true);
      try {
        const score = newAnswers.reduce(
          (s, a, i) => s + (a === quiz.questions[i].answer ? 1 : 0), 0,
        );
        await supabase.from("quiz_attempts").insert({
          quiz_id: quiz.id,
          session_id: getSessionId(),
          answers: newAnswers,
          score,
          total: quiz.questions.length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
        setStage("results");
      }
    } else {
      setIdx(idx + 1);
    }
  }

  function reset() {
    setStage("setup");
    setQuiz(null);
    setIdx(0);
    setAnswers([]);
    setSelected(null);
  }

  if (stage === "setup") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Quiz Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated quizzes from your uploaded documents.
          </p>
        </div>

        <Card className="border-border/50 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/40",
                )}>{d}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions</label>
            <div className="grid grid-cols-3 gap-2">
              {([5, 10, 20] as const).map((n) => (
                <button key={n} onClick={() => setNumQuestions(n)} className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                  numQuestions === n ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/40",
                )}>{n}</button>
              ))}
            </div>
          </div>
          <Button onClick={generate} disabled={generating} variant="hero" size="lg" className="w-full rounded-full">
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating from your documents...</> : <><Sparkles className="h-4 w-4" /> Generate Quiz</>}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Questions are generated from indexed PDFs in Study Materials.
          </p>
        </Card>
      </div>
    );
  }

  if (stage === "playing" && quiz) {
    const q = quiz.questions[idx];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="rounded-full">{quiz.title} · {difficulty}</Badge>
          <span className="text-muted-foreground">Question {idx + 1} of {quiz.questions.length}</span>
        </div>
        <Progress value={((idx + 1) / quiz.questions.length) * 100} className="h-2" />

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
            <Card className="border-border/50 p-7">
              <h2 className="font-display text-xl font-semibold leading-snug">{q.question}</h2>
              <div className="mt-6 grid gap-3">
                {q.options.map((o, i) => {
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/50 hover:bg-primary/5",
                      )}
                    >
                      <span className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-semibold",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{o}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={next} disabled={selected === null || submitting} variant="hero" className="rounded-full">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : idx + 1 >= quiz.questions.length ? "Submit" : "Next"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (!quiz) return null;
  const correct = answers.filter((a, i) => a === quiz.questions[i].answer).length;
  const score = Math.round((correct / quiz.questions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Quiz Complete!</h1>
        <p className="mt-1 text-sm text-muted-foreground">{quiz.title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 p-5">
          <p className="text-xs text-muted-foreground">Score</p>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: score, fill: "var(--color-chart-1)" }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "var(--color-muted)" }} dataKey="value" cornerRadius={20} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 28, fontWeight: 700 }}>{score}%</text>
            </RadialBarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="border-border/50 p-5 flex flex-col justify-center items-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="mt-2 font-display text-3xl font-bold">{correct}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </Card>
        <Card className="border-border/50 p-5 flex flex-col justify-center items-center">
          <XCircle className="h-10 w-10 text-rose-500" />
          <p className="mt-2 font-display text-3xl font-bold">{quiz.questions.length - correct}</p>
          <p className="text-xs text-muted-foreground">Wrong</p>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Review & Explanations</h2>
        {quiz.questions.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.answer;
          return (
            <Card key={i} className="border-border/50 p-5">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm">{i + 1}. {q.question}</p>
                  <div className="grid gap-1.5 text-sm">
                    {q.options.map((o, oi) => (
                      <div key={oi} className={cn(
                        "rounded-md px-3 py-1.5 border",
                        oi === q.answer && "border-emerald-500/50 bg-emerald-500/10",
                        oi === userAns && oi !== q.answer && "border-rose-500/50 bg-rose-500/10",
                        oi !== q.answer && oi !== userAns && "border-border/40",
                      )}>
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {o}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="font-semibold text-primary">Explanation: </span>
                    {q.explanation}
                  </div>
                  {(q.source || q.page) && (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1 rounded-full text-xs">
                        <FileText className="h-3 w-3" />
                        {q.source || "document"} · p.{q.page}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="lg" className="flex-1 rounded-full">
          <RotateCcw className="h-4 w-4" /> New Quiz
        </Button>
      </div>
    </div>
  );
}

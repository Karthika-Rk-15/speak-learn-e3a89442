import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ArrowRight, RotateCcw, Sparkles, CheckCircle2, XCircle, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { sampleQuiz } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/dashboard/quiz")({
  component: QuizPage,
});

type Stage = "setup" | "playing" | "results";

function QuizPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [subject, setSubject] = useState("DSA");
  const [difficulty, setDifficulty] = useState("Medium");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (stage !== "playing") return;
    setTimeLeft(30);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); next(-1); return 30; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, stage]);

  const next = (answer: number) => {
    const newAnswers = [...answers, answer];
    if (idx + 1 >= sampleQuiz.length) {
      setAnswers(newAnswers);
      setStage("results");
    } else {
      setAnswers(newAnswers);
      setIdx(idx + 1);
    }
  };

  const reset = () => { setStage("setup"); setIdx(0); setAnswers([]); };

  if (stage === "setup") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Quiz Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate an AI-powered quiz tailored to your level.</p>
        </div>

        <Card className="border-border/50 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["DSA", "DBMS", "OS", "CN", "AI"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/40",
                )}>{d}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button key={n} className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium",
                  n === 5 ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/40",
                )}>{n}</button>
              ))}
            </div>
          </div>
          <Button onClick={() => setStage("playing")} variant="hero" size="lg" className="w-full rounded-full">
            <Sparkles className="h-4 w-4" /> Generate Quiz
          </Button>
        </Card>
      </div>
    );
  }

  if (stage === "playing") {
    const q = sampleQuiz[idx];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="rounded-full">{subject} · {difficulty}</Badge>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span className={cn(timeLeft <= 10 && "text-rose-500 font-semibold")}>{timeLeft}s</span>
          </div>
        </div>
        <Progress value={((idx + 1) / sampleQuiz.length) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground">Question {idx + 1} of {sampleQuiz.length}</p>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
            <Card className="border-border/50 p-7">
              <h2 className="font-display text-xl font-semibold leading-snug">{q.q}</h2>
              <div className="mt-6 grid gap-3">
                {q.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => next(i)}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{o}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // results
  const correct = answers.filter((a, i) => a === sampleQuiz[i].answer).length;
  const score = Math.round((correct / sampleQuiz.length) * 100);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Quiz Complete!</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's how you did, Aarav.</p>
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
          <p className="text-xs text-muted-foreground">Correct Answers</p>
        </Card>
        <Card className="border-border/50 p-5 flex flex-col justify-center items-center">
          <XCircle className="h-10 w-10 text-rose-500" />
          <p className="mt-2 font-display text-3xl font-bold">{sampleQuiz.length - correct}</p>
          <p className="text-xs text-muted-foreground">Wrong Answers</p>
        </Card>
      </div>

      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> AI Feedback
        </div>
        <p className="text-sm leading-relaxed">
          Strong performance in algorithm complexity questions! Consider reviewing <span className="font-medium text-foreground">database normalization</span> and <span className="font-medium text-foreground">CPU scheduling edge cases</span>. I've added 3 personalized flashcards to your study deck.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">Recommended: 3NF deep-dive</Badge>
          <Badge variant="secondary" className="rounded-full">Practice: Round Robin</Badge>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="lg" className="flex-1 rounded-full"><RotateCcw className="h-4 w-4" /> New Quiz</Button>
        <Button variant="hero" size="lg" className="flex-1 rounded-full">Review Answers <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

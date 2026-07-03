import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

type QuizQuestion = {
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
  questions: QuizQuestion[];
  created_at: string;
};

type Attempt = {
  id: string;
  quiz_id: string;
  session_id: string;
  answers: number[];
  score: number;
  total: number;
  created_at: string;
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

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const sessionId = getSessionId();

        const { data: attemptsData, error: aErr } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });
        if (aErr) throw aErr;

        const attemptsList = (attemptsData ?? []) as unknown as Attempt[];
        const quizIds = Array.from(new Set(attemptsList.map((a) => a.quiz_id)));

        let quizMap: Record<string, Quiz> = {};
        if (quizIds.length > 0) {
          const { data: quizData, error: qErr } = await supabase
            .from("quizzes")
            .select("*")
            .in("id", quizIds);
          if (qErr) throw qErr;
          for (const q of (quizData ?? []) as unknown as Quiz[]) {
            quizMap[q.id] = q;
          }
        }

        if (cancelled) return;
        setAttempts(attemptsList);
        setQuizzes(quizMap);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => computeStats(attempts, quizzes), [attempts, quizzes]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="border-border/50 p-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold">No quiz attempts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Take a quiz in the Quiz Center to start seeing your learning analytics here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Quizzes Taken" value={stats.totalQuizzes.toString()} />
        <StatCard label="Avg. Score" value={`${stats.avgScore}%`} accent={stats.avgScore >= 70 ? "up" : "down"} />
        <StatCard label="Highest Score" value={`${stats.highestScore}%`} accent="up" />
        <StatCard label="Lowest Score" value={`${stats.lowestScore}%`} accent="down" />
        <StatCard label="Questions Answered" value={stats.totalQuestions.toString()} />
        <StatCard label="Accuracy" value={`${stats.accuracy}%`} accent={stats.accuracy >= 70 ? "up" : "down"} />
      </div>

      {/* Trend + distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/50 p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Score Trend</h3>
          <p className="text-xs text-muted-foreground">Your quiz score % over time</p>
          <ResponsiveContainer width="100%" height={260} className="mt-4">
            <AreaChart data={stats.trend}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="score" stroke="var(--color-chart-1)" strokeWidth={3} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Score Distribution</h3>
          <p className="text-xs text-muted-foreground">How your scores stack up</p>
          <ResponsiveContainer width="100%" height={240} className="mt-2">
            <PieChart>
              <Pie data={stats.distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {stats.distribution.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Strong / Weak topics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="font-display text-lg font-semibold">Strong Topics</h3>
          </div>
          <p className="text-xs text-muted-foreground">Documents where you score highest</p>
          {stats.strongTopics.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220} className="mt-4">
              <BarChart data={stats.strongTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="accuracy" fill="var(--color-chart-1)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="border-border/50 p-5">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            <h3 className="font-display text-lg font-semibold">Weak Topics</h3>
          </div>
          <p className="text-xs text-muted-foreground">Documents that need more review</p>
          {stats.weakTopics.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220} className="mt-4">
              <BarChart data={stats.weakTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="accuracy" fill="var(--color-chart-4)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Frequently missed + Most studied */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Frequently Missed Questions</h3>
          <p className="text-xs text-muted-foreground">Questions you've gotten wrong most often</p>
          <div className="mt-4 space-y-3">
            {stats.missedQuestions.length === 0 && (
              <p className="text-sm text-muted-foreground">No repeatedly-missed questions.</p>
            )}
            {stats.missedQuestions.map((q, i) => (
              <div key={i} className="rounded-xl border border-border/50 p-3">
                <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full">
                    Missed {q.wrong}/{q.attempts}
                  </Badge>
                  {q.source && (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {q.source} · p.{q.page}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Most Studied Documents</h3>
          <p className="text-xs text-muted-foreground">Documents that appear most in your quizzes</p>
          <div className="mt-4 space-y-3">
            {stats.studiedDocs.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents studied yet.</p>
            )}
            {stats.studiedDocs.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium">{d.name}</span>
                </div>
                <Badge variant="secondary" className="rounded-full">{d.count} Qs</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent attempts + history */}
      <Card className="border-border/50 p-5">
        <h3 className="font-display text-lg font-semibold">Quiz History</h3>
        <p className="text-xs text-muted-foreground">Your most recent quiz attempts</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Quiz</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Score</th>
                <th className="pb-3 pr-4 font-medium">Accuracy</th>
                <th className="pb-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stats.history.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4 font-medium">{r.title}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.date}</td>
                  <td className="py-3 pr-4">{r.score}/{r.total}</td>
                  <td className="py-3 pr-4">{r.pct}%</td>
                  <td className="py-3">
                    <Badge
                      variant="secondary"
                      className={
                        r.pct >= 80
                          ? "rounded-full bg-emerald-500/15 text-emerald-500"
                          : r.pct >= 50
                          ? "rounded-full bg-amber-500/15 text-amber-500"
                          : "rounded-full bg-rose-500/15 text-rose-500"
                      }
                    >
                      {r.pct >= 80 ? "Excellent" : r.pct >= 50 ? "Good" : "Needs work"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Learning Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Insights from your quiz performance and study sessions.
      </p>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "up" | "down" }) {
  return (
    <Card className="border-border/50 p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {accent && (
        <p className={"mt-1 text-xs " + (accent === "up" ? "text-emerald-500" : "text-rose-500")}>
          {accent === "up" ? "▲ On track" : "▼ Needs attention"}
        </p>
      )}
    </Card>
  );
}

// ---------- Analytics computation ----------

function computeStats(attempts: Attempt[], quizzes: Record<string, Quiz>) {
  const pctFor = (a: Attempt) => (a.total > 0 ? Math.round((a.score / a.total) * 100) : 0);
  const pcts = attempts.map(pctFor);

  const totalQuizzes = attempts.length;
  const totalQuestions = attempts.reduce((s, a) => s + (a.total || 0), 0);
  const totalCorrect = attempts.reduce((s, a) => s + (a.score || 0), 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgScore = pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : 0;
  const highestScore = pcts.length ? Math.max(...pcts) : 0;
  const lowestScore = pcts.length ? Math.min(...pcts) : 0;

  // Trend
  const trend = attempts.map((a, i) => ({
    label: `#${i + 1}`,
    score: pctFor(a),
    date: new Date(a.created_at).toLocaleDateString(),
  }));

  // Distribution
  const buckets = { "0–49%": 0, "50–69%": 0, "70–84%": 0, "85–100%": 0 };
  for (const p of pcts) {
    if (p < 50) buckets["0–49%"]++;
    else if (p < 70) buckets["50–69%"]++;
    else if (p < 85) buckets["70–84%"]++;
    else buckets["85–100%"]++;
  }
  const distribution = Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Per-source accuracy & question-level tracking
  const perSource: Record<string, { correct: number; total: number }> = {};
  const perQuestion: Record<
    string,
    { question: string; source: string; page: number; wrong: number; attempts: number }
  > = {};
  const docCount: Record<string, number> = {};

  for (const a of attempts) {
    const quiz = quizzes[a.quiz_id];
    if (!quiz || !Array.isArray(quiz.questions)) continue;
    quiz.questions.forEach((q, i) => {
      const src = q.source || "Unknown";
      if (!perSource[src]) perSource[src] = { correct: 0, total: 0 };
      perSource[src].total++;
      const userAns = a.answers?.[i];
      const correct = userAns === q.answer;
      if (correct) perSource[src].correct++;

      const key = `${src}::${q.question}`;
      if (!perQuestion[key]) {
        perQuestion[key] = { question: q.question, source: src, page: q.page, wrong: 0, attempts: 0 };
      }
      perQuestion[key].attempts++;
      if (!correct) perQuestion[key].wrong++;
    });
  }

  // Count questions in each unique quiz's source list
  for (const quizId of new Set(attempts.map((a) => a.quiz_id))) {
    const quiz = quizzes[quizId];
    if (!quiz?.questions) continue;
    for (const q of quiz.questions) {
      const src = q.source || "Unknown";
      docCount[src] = (docCount[src] || 0) + 1;
    }
  }

  const topics = Object.entries(perSource).map(([name, v]) => ({
    name: truncate(name, 22),
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    total: v.total,
  }));
  const strongTopics = [...topics].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);
  const weakTopics = [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);

  const missedQuestions = Object.values(perQuestion)
    .filter((q) => q.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.attempts - a.attempts)
    .slice(0, 5);

  const studiedDocs = Object.entries(docCount)
    .map(([name, count]) => ({ name: truncate(name, 40), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const history = [...attempts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      title: quizzes[a.quiz_id]?.title ?? "Quiz",
      date: new Date(a.created_at).toLocaleString(),
      score: a.score,
      total: a.total,
      pct: pctFor(a),
    }));

  return {
    totalQuizzes,
    totalQuestions,
    accuracy,
    avgScore,
    highestScore,
    lowestScore,
    trend,
    distribution,
    strongTopics,
    weakTopics,
    missedQuestions,
    studiedDocs,
    history,
  };
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

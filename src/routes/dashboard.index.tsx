import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Clock, MessageCircleQuestion, Award, Flame, ArrowUpRight, Sparkles, Mic, FileText, ListChecks,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { weeklyActivity, subjectPerformance, learningProgress, recentTopics } from "@/lib/mock-data";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function useCounter(target: number, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function StatCard({ icon: Icon, label, value, suffix = "", delta, gradient, delay = 0 }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number; suffix?: string;
  delta: string; gradient: string; delay?: number;
}) {
  const animated = useCounter(value);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card className="relative overflow-hidden border-border/50 p-5">
        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">
              {animated.toLocaleString()}{suffix}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
              <ArrowUpRight className="h-3 w-3" /> {delta}
            </p>
          </div>
          <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-glow`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back, Aarav 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's your learning snapshot for today.</p>
        </div>
        <Button asChild variant="hero" className="rounded-full">
          <Link to="/dashboard/voice"><Mic className="h-4 w-4" /> Start Voice Session</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Total Learning Hours" value={125} suffix="h" delta="+12% this week" gradient="from-indigo-500 to-purple-500" delay={0} />
        <StatCard icon={MessageCircleQuestion} label="Questions Asked" value={1542} delta="+204 this week" gradient="from-cyan-500 to-blue-500" delay={0.05} />
        <StatCard icon={Award} label="Quiz Score Average" value={89} suffix="%" delta="+4% this month" gradient="from-emerald-500 to-teal-500" delay={0.1} />
        <StatCard icon={Flame} label="Learning Streak" value={24} suffix=" days" delta="Personal best 🔥" gradient="from-orange-500 to-pink-500" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/50 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Weekly Learning Activity</h3>
              <p className="text-xs text-muted-foreground">Hours studied per day</p>
            </div>
            <Badge variant="secondary" className="rounded-full">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="var(--color-chart-1)" strokeWidth={3} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Jump back in</p>
          <div className="mt-4 space-y-2">
            {[
              { to: "/dashboard/tutor", icon: Sparkles, label: "Ask the AI Tutor", desc: "Get instant explanations" },
              { to: "/dashboard/materials", icon: FileText, label: "Upload Material", desc: "Add PDFs and notes" },
              { to: "/dashboard/quiz", icon: ListChecks, label: "Take a Quiz", desc: "Test your knowledge" },
              { to: "/dashboard/voice", icon: Mic, label: "Voice Session", desc: "Learn hands-free" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:border-primary/40 hover:bg-primary/5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Subject Performance</h3>
          <p className="text-xs text-muted-foreground">Score vs target</p>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Bar dataKey="target" fill="var(--color-muted)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="score" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Learning Progress</h3>
          <p className="text-xs text-muted-foreground">8-week trajectory</p>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <LineChart data={learningProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="progress" stroke="var(--color-chart-2)" strokeWidth={3} dot={{ r: 5, fill: "var(--color-chart-2)" }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="border-border/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Recent Topics</h3>
          <Button variant="ghost" size="sm">View all</Button>
        </div>
        <div className="divide-y divide-border/50">
          {recentTopics.map((t) => (
            <div key={t.topic} className="flex items-center gap-4 py-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.topic}</p>
                <p className="text-xs text-muted-foreground">{t.subject} • {t.duration}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{t.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

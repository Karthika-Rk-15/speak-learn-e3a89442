import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { weeklyActivity, subjectPerformance, learningProgress } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

const distribution = [
  { name: "DSA", value: 32, color: "var(--color-chart-1)" },
  { name: "AI", value: 24, color: "var(--color-chart-3)" },
  { name: "DBMS", value: 18, color: "var(--color-chart-2)" },
  { name: "OS", value: 14, color: "var(--color-chart-4)" },
  { name: "CN", value: 12, color: "var(--color-chart-5)" },
];

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Deep insights into your learning journey.</p>
        </div>
        <div className="flex gap-2">
          {["7D", "30D", "90D", "All"].map((p, i) => (
            <Badge key={p} variant={i === 1 ? "default" : "secondary"} className="cursor-pointer rounded-full px-3 py-1">{p}</Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg. Daily Hours", val: "3.6h", delta: "+0.4h" },
          { label: "Topics Mastered", val: "47", delta: "+8" },
          { label: "Best Subject", val: "AI · 95%", delta: "↑ 3pts" },
          { label: "Total Sessions", val: "312", delta: "+24" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{s.val}</p>
            <p className="mt-1 text-xs text-emerald-500">{s.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/50 p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Activity Heatmap</h3>
          <p className="text-xs text-muted-foreground">Daily learning hours & questions</p>
          <ResponsiveContainer width="100%" height={260} className="mt-4">
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} /><stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} /></linearGradient>
                <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="var(--color-chart-1)" strokeWidth={3} fill="url(#a1)" />
              <Area type="monotone" dataKey="questions" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#a2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Subject Distribution</h3>
          <p className="text-xs text-muted-foreground">Time allocation</p>
          <ResponsiveContainer width="100%" height={240} className="mt-2">
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={260} className="mt-4">
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Bar dataKey="score" fill="var(--color-chart-1)" radius={[10, 10, 0, 0]} />
              <Bar dataKey="target" fill="var(--color-chart-3)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/50 p-5">
          <h3 className="font-display text-lg font-semibold">Mastery Progress</h3>
          <ResponsiveContainer width="100%" height={260} className="mt-4">
            <LineChart data={learningProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="progress" stroke="var(--color-chart-3)" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

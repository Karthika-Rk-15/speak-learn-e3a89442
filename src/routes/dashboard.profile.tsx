import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { achievements } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/50 p-0">
        <div className="h-36 gradient-hero animate-gradient" />
        <div className="-mt-14 flex flex-col items-start gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl border-4 border-card gradient-primary text-4xl font-bold text-primary-foreground shadow-elegant">
            A
          </div>
          <div className="flex-1 pt-2">
            <h1 className="font-display text-2xl font-bold">Aarav Sharma</h1>
            <p className="text-sm text-muted-foreground">B.Tech CSE · 3rd Year · IIT Madras</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full">Learning Level: Advanced</Badge>
              <Badge variant="secondary" className="rounded-full">🔥 24-day streak</Badge>
              <Badge variant="secondary" className="rounded-full">Top 5%</Badge>
            </div>
          </div>
          <Button variant="outline" className="rounded-full">Edit Profile</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Level Progress", val: 78, sub: "Level 14 → 15" },
          { label: "Weekly Goal", val: 86, sub: "26h / 30h" },
          { label: "Quiz Mastery", val: 89, sub: "47/53 topics" },
        ].map((p) => (
          <Card key={p.label} className="border-border/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{p.label}</p>
              <span className="text-sm font-semibold gradient-text">{p.val}%</span>
            </div>
            <Progress value={p.val} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{p.sub}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">Achievements</h2>
        <p className="text-sm text-muted-foreground">Milestones you've unlocked</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[a.icon] ?? Icons.Star;
            return (
              <motion.div key={a.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="group relative overflow-hidden border-border/50 p-5 transition-all hover:-translate-y-1 hover:shadow-elegant">
                  <div className={`mb-3 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${a.color} text-white shadow-glow`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="font-display font-semibold">{a.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

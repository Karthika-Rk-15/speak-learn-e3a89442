import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Brain, Send, Sparkles, BookOpen, Code, FlaskConical, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/tutor")({
  component: TutorPage,
});

const suggestions = [
  { icon: Code, title: "Explain recursion", desc: "with a real example" },
  { icon: Calculator, title: "Help me solve", desc: "a calculus problem" },
  { icon: FlaskConical, title: "Compare TCP vs UDP", desc: "with use cases" },
  { icon: BookOpen, title: "Summarize Chapter 4", desc: "from my DBMS notes" },
];

type Msg = { role: "user" | "ai"; content: string };

function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", content: "Great question! Here's a clear, structured explanation tailored to your current level. Let me break it down with examples, then test your understanding with a quick follow-up." },
      ]);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-sm text-muted-foreground">Personalized explanations on any topic</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="border-border/50 p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-semibold">What do you want to learn today?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick a starter or ask anything below.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => send(`${s.title} ${s.desc}`)}
                className="flex items-center gap-3 rounded-xl border border-border/50 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="border-border/50 p-6">
          <div className="space-y-5">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", m.role === "user" ? "bg-primary text-primary-foreground" : "gradient-primary text-primary-foreground")}>
                  {m.role === "user" ? "A" : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60")}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask your tutor anything..."
          className="h-12 rounded-full bg-background pl-5"
        />
        <Button onClick={() => send(input)} variant="hero" size="icon" className="h-12 w-12 rounded-full">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

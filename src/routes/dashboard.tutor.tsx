import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Brain, Send, Sparkles, BookOpen, Code, FlaskConical, Calculator, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const t = useT();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Establish per-user session id and load history
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      const sid = uid ? `tutor_user_${uid}` : `tutor_anon_${crypto.randomUUID()}`;
      setSessionId(sid);
      const { data: rows } = await supabase
        .from("chat_history")
        .select("id, question, answer, created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: true })
        .limit(50);
      if (rows?.length) {
        const msgs: Msg[] = [];
        for (const r of rows) {
          msgs.push({ role: "user", content: r.question });
          msgs.push({ role: "ai", content: r.answer });
        }
        setMessages(msgs);
      }
    })();
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, level: "intermediate" }),
      });
      if (!res.ok) {
        if (res.status === 429) toast.error("Rate limited. Please wait a moment and try again.");
        else if (res.status === 402) toast.error("AI credits exhausted. Please add credits to continue.");
        else {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          toast.error(err.error || "Failed to get response");
        }
        return;
      }
      const { answer } = (await res.json()) as { answer: string };
      setMessages((m) => [...m, { role: "ai", content: answer }]);

      if (sessionId) {
        supabase
          .from("chat_history")
          .insert({ session_id: sessionId, question: q, answer, level: "intermediate" })
          .then(({ error }) => {
            if (error) console.error("Persist chat error", error);
          });
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error talking to AI");
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("tutor.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("tutor.subtitle")}</p>
        </div>
      </div>

      {messages.length === 0 && !thinking ? (
        <Card className="border-border/50 p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-semibold">{t("tutor.prompt")}</h2>
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
                  {m.role === "ai" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-headings:font-display prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  LearnMate is thinking…
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask your tutor anything..."
          disabled={thinking}
          className="h-12 rounded-full bg-background pl-5"
        />
        <Button onClick={() => send(input)} disabled={thinking || !input.trim()} variant="hero" size="icon" className="h-12 w-12 rounded-full">
          {thinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}

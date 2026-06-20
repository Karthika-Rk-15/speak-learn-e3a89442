import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Send, Copy, Volume2, Square, Loader2, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Waveform } from "@/components/visual/Waveform";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/voice")({
  component: VoicePage,
});

type Level = "beginner" | "intermediate" | "advanced";
type Msg = { id: string; role: "user" | "ai"; content: string; createdAt: number };

const SESSION_KEY = "learnmate.session_id";
function getSessionId() {
  if (typeof window === "undefined") return "ssr-placeholder";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Web Speech API typings (minimal)
type SR = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};

function VoicePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<Level>("intermediate");
  const [thinking, setThinking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const recognitionRef = useRef<SR | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sessionId = useMemo(getSessionId, []);

  // Load history
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chat_history")
        .select("id, question, answer, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data?.length) {
        const msgs: Msg[] = [];
        for (const row of data) {
          const ts = new Date(row.created_at).getTime();
          msgs.push({ id: `${row.id}-q`, role: "user", content: row.question, createdAt: ts });
          msgs.push({ id: `${row.id}-a`, role: "ai", content: row.answer, createdAt: ts + 1 });
        }
        setMessages(msgs);
      }
    })();
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, interim]);

  const askAI = async (question: string) => {
    if (!question.trim()) return;
    const uId = `u_${Date.now()}`;
    setMessages((m) => [...m, { id: uId, role: "user", content: question, createdAt: Date.now() }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, level }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        if (res.status === 429) toast.error("Rate limited. Please wait a moment.");
        else if (res.status === 402) toast.error("AI credits exhausted. Please add credits.");
        else toast.error(err.error || "Failed to get response");
        return;
      }
      const { answer } = (await res.json()) as { answer: string };
      const aId = `a_${Date.now()}`;
      setMessages((m) => [...m, { id: aId, role: "ai", content: answer, createdAt: Date.now() }]);

      // Persist
      supabase
        .from("chat_history")
        .insert({ session_id: sessionId, question, answer, level })
        .then(({ error }) => {
          if (error) console.error("Persist error", error);
        });
    } catch (e) {
      console.error(e);
      toast.error("Network error talking to AI");
    } finally {
      setThinking(false);
    }
  };

  const startListening = () => {
    const SRClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SRClass) {
      toast.error("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    const rec: SR = new SRClass();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalText = "";
    rec.onresult = (e: any) => {
      let interimT = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimT += t;
      }
      setInterim(interimT);
      if (finalText) setInput(finalText);
    };
    rec.onerror = (e: any) => {
      toast.error(`Mic error: ${e.error || "unknown"}`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      if (finalText.trim()) askAI(finalText.trim());
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const playVoice = async (id: string, text: string) => {
    try {
      if (speakingId === id) {
        audioRef.current?.pause();
        setSpeakingId(null);
        return;
      }
      audioRef.current?.pause();
      setSpeakingId(id);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        setSpeakingId(null);
        toast.error("Failed to generate voice");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeakingId(null);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      setSpeakingId(null);
      toast.error("Audio playback failed");
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const clearChat = async () => {
    setMessages([]);
    toast("Chat cleared (local view)");
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Voice AI Tutor</h1>
          <p className="text-sm text-muted-foreground">
            Ask anything. LearnMate explains it your way.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">🌱 Beginner</SelectItem>
              <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
              <SelectItem value="advanced">🧠 Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={clearChat} title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat */}
      <Card className="relative flex-1 overflow-hidden border-border/60 bg-card/60 backdrop-blur">
        <div ref={scrollRef} className="h-full space-y-6 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && !thinking && (
            <EmptyState onPick={(q) => askAI(q)} />
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "group max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[75%]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 bg-background/80",
                  )}
                >
                  {m.role === "ai" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-headings:font-display prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}

                  {m.role === "ai" && (
                    <div className="mt-3 flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => copy(m.content)}
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => playVoice(m.id, m.content)}
                      >
                        {speakingId === m.id ? (
                          <>
                            <Square className="h-3 w-3" /> Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" /> Play Voice
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                LearnMate is thinking…
              </div>
            </motion.div>
          )}
        </div>

        {/* Listening overlay */}
        <AnimatePresence>
          {listening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-background via-background/95 to-transparent pb-4 pt-10"
            >
              <Waveform active />
              <p className="text-sm font-medium text-primary">Listening… speak now</p>
              {interim && <p className="max-w-md text-xs text-muted-foreground">{interim}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Composer */}
      <div className="flex items-end gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={listening ? stopListening : startListening}
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg transition-colors",
            listening
              ? "bg-destructive text-destructive-foreground"
              : "gradient-primary text-primary-foreground",
          )}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          {listening && (
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />
          )}
        </motion.button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            askAI(input);
          }}
          className="flex flex-1 items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-3 py-2 backdrop-blur"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask LearnMate anything…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            disabled={thinking}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || thinking}
            className="gradient-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const samples = [
    "Explain recursion with a simple example",
    "What is the difference between SQL and NoSQL?",
    "How does HTTPS actually work?",
    "Teach me Big-O notation",
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow">
          <Sparkles className="h-9 w-9" />
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl font-bold">Your AI Tutor is ready</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the microphone or type a question to begin.
        </p>
      </div>
      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/30"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

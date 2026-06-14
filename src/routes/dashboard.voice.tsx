import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Send, Sparkles, Copy, Volume2, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Waveform } from "@/components/visual/Waveform";
import { conversations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/voice")({
  component: VoicePage,
});

type Msg = { role: "user" | "ai"; content: string };

const initial: Msg[] = [
  { role: "user", content: "Can you explain Dijkstra's algorithm in simple terms?" },
  { role: "ai", content: "Of course! Dijkstra's algorithm finds the shortest path from a starting node to every other node in a weighted graph. Think of it like a GPS finding the fastest route through a city.\n\nThe key idea: at each step, pick the unvisited node with the smallest known distance, then update its neighbors. It uses a priority queue and runs in O((V + E) log V) time. Would you like a step-by-step example?" },
  { role: "user", content: "Yes, walk me through an example with 5 nodes." },
];

function VoicePage() {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", content: "Great question! Let me walk you through it with a clear example so you can really see how it works step by step. 🚀\n\nImagine 5 nodes: A, B, C, D, E with weighted edges between them. We start at A with distance 0 and infinity for the rest..." },
      ]);
    }, 700);
  };

  const toggleMic = () => {
    setListening((v) => !v);
    if (!listening) {
      toast("Listening... speak naturally");
      setTimeout(() => {
        setListening(false);
        send("Explain the difference between BFS and DFS.");
      }, 2200);
    }
  };

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* History */}
      <Card className="hidden flex-col border-border/50 p-4 lg:flex">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-semibold">Conversations</h3>
          <Button size="icon" variant="ghost" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="-mx-2 flex-1 space-y-1 overflow-y-auto px-2">
          {conversations.map((c, i) => (
            <button
              key={c.id}
              className={cn(
                "block w-full rounded-lg p-2.5 text-left transition-colors",
                i === 0 ? "bg-primary/10 text-foreground" : "hover:bg-accent/10 text-muted-foreground hover:text-foreground",
              )}
            >
              <p className="truncate text-sm font-medium">{c.title}</p>
              <p className="text-xs opacity-70">{c.time}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Conversation */}
      <Card className="flex flex-col overflow-hidden border-border/50">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <div>
            <h3 className="font-display font-semibold">AI Voice Assistant</h3>
            <p className="text-xs text-muted-foreground">{listening ? "Listening..." : "Ready when you are"}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Online
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}
            >
              <div className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                m.role === "user" ? "bg-primary text-primary-foreground" : "gradient-primary text-primary-foreground",
              )}>
                {m.role === "user" ? "A" : <Sparkles className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[75%] space-y-1", m.role === "user" && "items-end")}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-foreground",
                )}>
                  {m.content}
                </div>
                {m.role === "ai" && (
                  <div className="flex gap-1 text-muted-foreground">
                    {[Copy, Volume2, ThumbsUp, ThumbsDown].map((Icon, j) => (
                      <button key={j} className="rounded-md p-1.5 hover:bg-accent/10 hover:text-foreground"><Icon className="h-3.5 w-3.5" /></button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Composer + mic */}
        <div className="border-t border-border/50 bg-muted/20 p-4">
          <AnimatePresence>
            {listening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-2xl glass-strong p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-rose-500"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Listening — transcribing in real time</span>
                </div>
                <Waveform />
                <p className="mt-3 text-sm text-muted-foreground italic">"Explain the difference between BFS and..."</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything, or hold the mic..."
              className="h-12 rounded-full bg-background pl-5"
            />
            <Button size="icon" onClick={() => send(input)} className="h-12 w-12 rounded-full" variant="outline">
              <Send className="h-5 w-5" />
            </Button>
            <button
              onClick={toggleMic}
              className={cn(
                "relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-primary-foreground transition-all",
                listening ? "bg-rose-500 animate-pulse-glow" : "gradient-primary shadow-glow hover:scale-105",
              )}
              aria-label="Toggle microphone"
            >
              <Mic className="h-6 w-6" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

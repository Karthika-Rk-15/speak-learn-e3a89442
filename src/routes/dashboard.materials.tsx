import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Upload, FileText, Search, MoreVertical, FileType2, FileImage, Sparkles, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { documents } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/materials")({
  component: MaterialsPage,
});

function MaterialsPage() {
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Study Materials</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload your notes and ask anything — answers grounded in your material.</p>
      </div>

      {/* Upload zone */}
      <Card
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        className={`relative overflow-hidden border-2 border-dashed p-10 text-center transition-all ${dragOver ? "border-primary bg-primary/5" : "border-border/60"}`}
      >
        <motion.div animate={{ y: dragOver ? -4 : 0 }} className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Upload className="h-7 w-7" />
        </motion.div>
        <h3 className="font-display text-lg font-semibold">Drag & drop your files here</h3>
        <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX, PPT — up to 25 MB each</p>
        <Button variant="hero" className="mt-5 rounded-full">Browse Files</Button>

        {/* Mock upload progress */}
        <div className="mt-6 mx-auto max-w-md rounded-xl border border-border/50 bg-muted/30 p-3 text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><FileType2 className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">Computer Networks Lecture 7.pdf</p>
              <Progress value={68} className="mt-1.5 h-1.5" />
            </div>
            <span className="text-xs text-muted-foreground">68%</span>
          </div>
        </div>
      </Card>

      {/* Ask from document */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> Ask From Your Documents
        </div>
        <div className="flex gap-2">
          <Input
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder="Ask anything about your uploaded material..."
            onKeyDown={(e) => e.key === "Enter" && askInput.trim() && setAnswer("Based on your Operating Systems Notes (page 12): Process scheduling determines which process gets CPU time. The notes outline FCFS, SJF, Round Robin, and Priority scheduling — with Round Robin being the most fair for time-sharing systems.")}
            className="h-11 rounded-full bg-background"
          />
          <Button variant="hero" className="rounded-full" onClick={() => askInput.trim() && setAnswer("Based on your Operating Systems Notes (page 12): Process scheduling determines which process gets CPU time. The notes outline FCFS, SJF, Round Robin, and Priority scheduling — with Round Robin being the most fair for time-sharing systems.")}>
            <Send className="h-4 w-4" /> Ask
          </Button>
        </div>
        {answer && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-background/80 p-4 text-sm leading-relaxed">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> LearnMate AI · sourced from your notes
            </div>
            {answer}
          </motion.div>
        )}
      </Card>

      {/* Library */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Document Library</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documents..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-muted/50" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.filter((d) => d.title.toLowerCase().includes(query.toLowerCase())).map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="group h-full overflow-hidden border-border/50 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  {d.title.endsWith(".pdf") ? <FileText className="h-6 w-6" /> : <FileImage className="h-6 w-6" />}
                </div>
                <button className="rounded-md p-1 text-muted-foreground hover:bg-accent/10 hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 truncate font-medium" title={d.title}>{d.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{d.subject}</span><span>•</span><span>{d.size}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{d.date}</span>
                <Badge variant={d.status === "Indexed" ? "secondary" : "outline"} className="rounded-full text-xs">
                  {d.status === "Indexed" ? "✓ Indexed" : "⏳ Processing"}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

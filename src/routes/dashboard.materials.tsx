import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Upload, FileText, Search, MoreVertical, FileType2, Sparkles, Send, Trash2, Download, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/materials")({
  component: MaterialsPage,
});

type DocRow = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: string;
  created_at: string;
};

type UploadingItem = {
  id: string;
  name: string;
  progress: number;
};

const BUCKET = "pdf-documents";

function getSessionId() {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem("learnmate_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("learnmate_session_id", id);
  }
  return id;
}

function formatSize(bytes: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function MaterialsPage() {
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerSources, setAnswerSources] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessionId = typeof window !== "undefined" ? getSessionId() : "anon";

  async function askDocuments() {
    const q = askInput.trim();
    if (!q || asking) return;
    setAsking(true);
    setAnswer(null);
    setAnswerSources([]);
    try {
      const res = await fetch("/api/ask-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to get an answer");
      } else {
        setAnswer(data.answer ?? "No answer returned.");
        setAnswerSources(data.sources ?? []);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Network error");
    } finally {
      setAsking(false);
    }
  }

  async function loadDocs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load documents");
    else setDocs((data as DocRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    for (const file of list) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error(`${file.name} is not a PDF`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 25 MB`);
        continue;
      }

      const tempId = crypto.randomUUID();
      setUploading((u) => [...u, { id: tempId, name: file.name, progress: 10 }]);

      const path = `${sessionId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;

      // simulated progress while upload runs (supabase-js v2 doesn't stream progress)
      const tick = setInterval(() => {
        setUploading((u) => u.map((x) => (x.id === tempId ? { ...x, progress: Math.min(x.progress + 10, 85) } : x)));
      }, 250);

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: "application/pdf",
        upsert: false,
      });
      clearInterval(tick);

      if (upErr) {
        setUploading((u) => u.filter((x) => x.id !== tempId));
        toast.error(`Upload failed: ${upErr.message}`);
        continue;
      }

      setUploading((u) => u.map((x) => (x.id === tempId ? { ...x, progress: 95 } : x)));

      const { error: insErr } = await supabase.from("documents").insert({
        session_id: sessionId,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        status: "Indexed",
      });

      if (insErr) {
        toast.error(`Saved file but failed to record: ${insErr.message}`);
      } else {
        toast.success(`${file.name} uploaded`);
      }

      setUploading((u) => u.filter((x) => x.id !== tempId));
      await loadDocs();
    }
  }

  async function openDoc(d: DocRow) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(d.file_path, 60 * 10);
    if (error || !data) return toast.error("Could not open file");
    window.open(data.signedUrl, "_blank");
  }

  async function deleteDoc(d: DocRow) {
    await supabase.storage.from(BUCKET).remove([d.file_path]);
    const { error } = await supabase.from("documents").delete().eq("id", d.id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Removed");
      setDocs((prev) => prev.filter((x) => x.id !== d.id));
    }
  }

  const filtered = docs.filter((d) => d.file_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Study Materials</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload your PDFs and ask anything — answers grounded in your material.</p>
      </div>

      {/* Upload zone */}
      <Card
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={`relative overflow-hidden border-2 border-dashed p-10 text-center transition-all ${dragOver ? "border-primary bg-primary/5" : "border-border/60"}`}
      >
        <motion.div animate={{ y: dragOver ? -4 : 0 }} className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Upload className="h-7 w-7" />
        </motion.div>
        <h3 className="font-display text-lg font-semibold">Drag & drop your PDFs here</h3>
        <p className="mt-1 text-sm text-muted-foreground">PDF files — up to 25 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Button variant="hero" className="mt-5 rounded-full" onClick={() => inputRef.current?.click()}>Browse Files</Button>

        {uploading.length > 0 && (
          <div className="mt-6 mx-auto max-w-md space-y-2">
            {uploading.map((u) => (
              <div key={u.id} className="rounded-xl border border-border/50 bg-muted/30 p-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FileType2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{u.name}</p>
                    <Progress value={u.progress} className="mt-1.5 h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground">{u.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
            onKeyDown={(e) => { if (e.key === "Enter") askDocuments(); }}
            disabled={asking}
            className="h-11 rounded-full bg-background"
          />
          <Button variant="hero" className="rounded-full" onClick={askDocuments} disabled={asking || !askInput.trim()}>
            {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask
          </Button>
        </div>
        {asking && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-background/80 p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Reading your documents…
          </div>
        )}
        {answer && !asking && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-background/80 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> LearnMate AI · sourced from your notes
            </div>
            {answer}
            {answerSources.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {answerSources.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full text-xs">{s}</Badge>
                ))}
              </div>
            )}
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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-44 animate-pulse border-border/50 p-5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center p-12 text-center border-dashed">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="font-medium">No documents yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload your first PDF to build your personal knowledge library.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="group h-full overflow-hidden border-border/50 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <button className="rounded-md p-1 text-muted-foreground hover:bg-accent/10 hover:text-foreground" aria-label="More">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 truncate font-medium" title={d.file_name}>{d.file_name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>PDF</span><span>•</span><span>{formatSize(d.file_size)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                  <Badge variant={d.status === "Indexed" ? "secondary" : "outline"} className="rounded-full text-xs">
                    {d.status === "Indexed" ? "✓ Indexed" : (
                      <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> {d.status}</span>
                    )}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-full" onClick={() => openDoc(d)}>
                    <Download className="h-3.5 w-3.5" /> Open
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => deleteDoc(d)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Brain,
  FileText,
  Sparkles,
  BarChart3,
  TrendingUp,
  Languages,
  Play,
  Video,
} from "lucide-react";

const featureList = [
  { icon: Mic, label: "Voice AI Tutor" },
  { icon: Brain, label: "AI Tutor" },
  { icon: FileText, label: "Study Materials" },
  { icon: Sparkles, label: "Quiz Generator" },
  { icon: BarChart3, label: "Analytics" },
  { icon: TrendingUp, label: "Progress Tracking" },
  { icon: Languages, label: "Multi-language Support" },
];

export function DemoModalTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="glass"
        size="xl"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        <Play className="h-5 w-5" /> Watch Demo
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold tracking-tight">
                LearnMate <span className="gradient-text">AI</span>
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your personal voice-powered learning companion. Ask questions using
                your voice, upload study materials, generate quizzes, and receive
                personalized AI-powered learning assistance anytime — in English or
                Tamil.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Features */}
          <div className="px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Features
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {featureList.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/40 px-3 py-2.5"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Video placeholder */}
          <div className="px-6 pb-6">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Video className="h-10 w-10 opacity-40" />
                <p className="text-sm font-medium">Demo video coming soon</p>
                <p className="text-xs opacity-70">
                  A walkthrough of LearnMate AI will appear here.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

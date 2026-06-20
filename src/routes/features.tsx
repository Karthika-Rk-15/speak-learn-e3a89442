import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Mic, Brain, FileText, Sparkles, Languages, TrendingUp,
  Check, ArrowRight, MessageSquare, BarChart3, BookOpen, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MeshBackground } from "@/components/visual/Backgrounds";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — LearnMate AI" },
      { name: "description", content: "Voice learning, AI tutor, quiz generator, study material assistant and more — explore every feature of LearnMate AI." },
      { property: "og:title", content: "LearnMate AI Features" },
      { property: "og:description", content: "Everything you need to learn smarter with voice-powered AI." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: Mic, title: "Voice Learning", desc: "Speech-to-text powered conversations with natural, real-time responses.", bullets: ["Speech-to-Text", "Natural conversations", "Real-time responses"], gradient: "from-indigo-500 to-purple-500" },
  { icon: Brain, title: "AI Tutor", desc: "Personalized explanations tailored to how you learn best.", bullets: ["Topic breakdowns", "Real-world examples", "Follow-up questions"], gradient: "from-purple-500 to-pink-500" },
  { icon: Sparkles, title: "Quiz Generator", desc: "AI-crafted assessments with instant scoring and analytics.", bullets: ["MCQ generation", "Instant scoring", "Performance tracking"], gradient: "from-cyan-500 to-blue-500" },
  { icon: FileText, title: "Study Material Assistant", desc: "Upload PDFs, notes, slides — ask questions grounded in your material.", bullets: ["PDF & DOCX upload", "Notes analysis", "RAG-based Q&A"], gradient: "from-emerald-500 to-cyan-500" },
  { icon: Languages, title: "Multi-Language", desc: "Learn in English or Tamil — voice and text in both languages.", bullets: ["English & Tamil", "Voice interactions", "Native fluency"], gradient: "from-amber-500 to-orange-500" },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Beautiful analytics that keep you motivated.", bullets: ["Learning streaks", "Quiz performance", "Skill growth"], gradient: "from-pink-500 to-rose-500" },
  { icon: MessageSquare, title: "Conversational Memory", desc: "Your tutor remembers context across sessions so learning feels continuous.", bullets: ["Long-term memory", "Topic threads", "Personal style"], gradient: "from-blue-500 to-indigo-500" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Identify weak areas with subject-level breakdowns and time insights.", bullets: ["Subject mastery", "Time spent", "Weakness detection"], gradient: "from-fuchsia-500 to-purple-500" },
  { icon: BookOpen, title: "Curated Paths", desc: "Structured learning paths for DSA, DBMS, OS, CN, AI and more.", bullets: ["Guided modules", "Step-by-step", "Project ideas"], gradient: "from-teal-500 to-emerald-500" },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden pt-36 pb-16">
        <MeshBackground />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> Features
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
              A complete <span className="gradient-text">AI learning suite</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Voice, vision, and intelligence — working together so you can master any subject faster.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                  <div className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-glow`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500" /> {b}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild variant="hero" size="xl" className="rounded-full">
              <Link to="/dashboard">Try it free <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

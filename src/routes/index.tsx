import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Mic, Brain, FileText, Sparkles, Languages, TrendingUp, Play, ArrowRight,
  Check, Star, BookOpen, Zap, MessageSquare, BarChart3, Github, Twitter, Linkedin, Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/visual/Logo";
import { ThemeToggle } from "@/components/visual/ThemeToggle";
import { MeshBackground, Particles } from "@/components/visual/Backgrounds";
import { Waveform } from "@/components/visual/Waveform";
import { testimonials } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnMate AI — Your Voice-Powered Learning Companion" },
      { name: "description", content: "Learn anything through natural voice conversations with AI. Upload study materials, generate quizzes, and master any subject with personalized AI tutoring." },
      { property: "og:title", content: "LearnMate AI — Voice-Powered Learning" },
      { property: "og:description", content: "Personalized AI tutor that learns with you, by voice." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "Voice Learning", desc: "Speech-to-text powered conversations with natural, real-time responses.", bullets: ["Speech-to-Text", "Natural conversations", "Real-time responses"], gradient: "from-indigo-500 to-purple-500" },
  { icon: Brain, title: "AI Tutor", desc: "Personalized explanations tailored to how you learn best.", bullets: ["Topic breakdowns", "Real-world examples", "Follow-up questions"], gradient: "from-purple-500 to-pink-500" },
  { icon: Sparkles, title: "Quiz Generator", desc: "AI-crafted assessments with instant scoring and analytics.", bullets: ["MCQ generation", "Instant scoring", "Performance tracking"], gradient: "from-cyan-500 to-blue-500" },
  { icon: FileText, title: "Study Material Assistant", desc: "Upload PDFs, notes, slides — ask questions, get answers grounded in your material.", bullets: ["PDF & DOCX upload", "Notes analysis", "RAG-based Q&A"], gradient: "from-emerald-500 to-cyan-500" },
  { icon: Languages, title: "Multi-Language", desc: "Learn in English or Tamil — voice and text in both languages.", bullets: ["English & Tamil", "Voice interactions", "Native fluency"], gradient: "from-amber-500 to-orange-500" },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Beautiful analytics that keep you motivated.", bullets: ["Learning streaks", "Quiz performance", "Skill growth"], gradient: "from-pink-500 to-rose-500" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-4 max-w-7xl px-4">
          <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-soft">
            <Logo />
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
              <a href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Reviews</a>
              <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
              <Link to="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="hero" size="sm" className="rounded-full">
                <Link to="/dashboard">Start Learning</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-40 pb-24">
        <MeshBackground />
        <Particles />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
              <span className="grid h-2 w-2 place-items-center rounded-full bg-emerald-500"><span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" /></span>
              Powered by next-gen voice AI
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              LearnMate <span className="gradient-text">AI</span>
            </h1>
            <p className="mt-4 max-w-xl text-xl text-muted-foreground md:text-2xl">
              Your personal <span className="text-foreground font-medium">voice-powered</span> learning companion.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Learn anything through natural conversations. Ask questions using your voice, upload study materials, generate quizzes, and receive personalized AI-powered learning assistance anytime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl" className="rounded-full">
                <Link to="/dashboard">Start Learning <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
              <Button variant="glass" size="xl" className="rounded-full">
                <Play className="h-5 w-5" /> Watch Demo
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Free to start</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> No credit card</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> English & Tamil</div>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative">
            <div className="relative mx-auto aspect-square max-w-[520px]">
              {/* outer rings */}
              <div className="absolute inset-0 rounded-full border border-primary/20" />
              <div className="absolute inset-8 rounded-full border border-cyan/20" />
              <div className="absolute inset-16 rounded-full border border-accent/20" />

              {/* central mic */}
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-1/4 grid place-items-center rounded-full gradient-hero shadow-glow animate-pulse-glow"
              >
                <Mic className="h-20 w-20 text-white" strokeWidth={2} />
              </motion.div>

              {/* floating icons */}
              {[
                { Icon: Brain, pos: "top-4 left-8", delay: 0 },
                { Icon: BookOpen, pos: "top-12 right-4", delay: 0.5 },
                { Icon: Sparkles, pos: "bottom-12 left-4", delay: 1 },
                { Icon: Zap, pos: "bottom-4 right-12", delay: 1.5 },
                { Icon: MessageSquare, pos: "top-1/2 -left-4", delay: 2 },
                { Icon: BarChart3, pos: "top-1/2 -right-4", delay: 2.5 },
              ].map(({ Icon, pos, delay }, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${pos} grid h-12 w-12 place-items-center rounded-2xl glass-strong shadow-soft`}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </motion.div>
              ))}
            </div>
            <div className="mx-auto mt-6 max-w-md rounded-2xl glass-strong p-4 shadow-soft">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Listening...</span>
                <span>00:12</span>
              </div>
              <Waveform />
            </div>
          </motion.div>
        </div>

        {/* trust strip */}
        <div className="relative mx-auto mt-20 max-w-6xl px-4">
          <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">Trusted by learners at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {["IIT Madras", "NIT Trichy", "BITS Pilani", "VIT", "SRM", "Anna University"].map((n) => (
              <span key={n} className="font-display text-sm font-semibold tracking-tight">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Features
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need to <span className="gradient-text">learn smarter</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete AI learning suite — voice, vision, and intelligence working together.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
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
                  <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Three steps to <span className="gradient-text">mastery</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Speak or Type", desc: "Ask anything — natural voice or text, in English or Tamil." },
              { step: "02", title: "AI Tutors You", desc: "Get clear, personalized explanations grounded in your materials." },
              { step: "03", title: "Practice & Track", desc: "Auto-generated quizzes and beautiful analytics keep you progressing." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl glass-strong p-8 shadow-soft"
              >
                <div className="mb-4 font-display text-5xl font-bold text-primary/30">{s.step}</div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Loved by <span className="gradient-text">learners worldwide</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">"{t.content}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Simple, <span className="gradient-text">student-friendly</span> pricing
            </h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 p-8">
              <h3 className="font-display text-xl font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">Perfect to get started</p>
              <div className="mt-6 font-display text-5xl font-bold">₹0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Basic AI Tutor", "Voice Learning (30 min/day)", "5 quizzes per day", "1 study material upload"].map((b) => (
                  <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{b}</li>
                ))}
              </ul>
              <Button asChild variant="outline" size="lg" className="mt-8 w-full rounded-full">
                <Link to="/dashboard">Get Started Free</Link>
              </Button>
            </Card>
            <Card className="relative overflow-hidden border-primary/40 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 shadow-glow">
              <div className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most Popular</div>
              <h3 className="font-display text-xl font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">For serious learners</p>
              <div className="mt-6 font-display text-5xl font-bold">₹299<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Unlimited Questions", "Advanced Analytics", "PDF Learning (RAG)", "Personalized Learning Paths", "Priority voice processing", "Tamil + English support"].map((b) => (
                  <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{b}</li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-8 w-full rounded-full">
                <Link to="/dashboard">Start Pro Trial</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-hero animate-gradient p-12 text-center shadow-elegant md:p-20">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">Ready to learn smarter?</h2>
              <p className="mt-4 text-lg text-white/85">Join thousands of students mastering subjects with LearnMate AI.</p>
              <Button asChild size="xl" className="mt-8 rounded-full bg-white text-primary hover:bg-white/90">
                <Link to="/dashboard">Start Learning Free <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Your personal voice-powered AI learning companion. Built for the next generation of learners.
              </p>
              <div className="mt-4 flex gap-2">
                {[Linkedin, Github, Twitter, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Voice Assistant", "AI Tutor", "Pricing"] },
              { title: "Resources", links: ["Documentation", "Guides", "Blog", "Community"] },
              { title: "Company", links: ["About", "Contact", "Careers", "Privacy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-6 text-xs text-muted-foreground">
            <p>© 2026 LearnMate AI. All rights reserved.</p>
            <p>Made with 💜 for learners.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

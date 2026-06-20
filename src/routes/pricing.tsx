import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MeshBackground } from "@/components/visual/Backgrounds";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — LearnMate AI" },
      { name: "description", content: "Simple, student-friendly pricing. Start free and upgrade to Pro when you're ready." },
      { property: "og:title", content: "LearnMate AI Pricing" },
      { property: "og:description", content: "Free to start. Pro from ₹299/month." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "₹0",
    tagline: "Perfect to get started",
    features: ["Basic AI Tutor", "Voice Learning (30 min/day)", "5 quizzes per day", "1 study material upload", "English + Tamil"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹299",
    tagline: "For serious learners",
    features: ["Unlimited Questions", "Advanced Analytics", "PDF Learning (RAG)", "Personalized Learning Paths", "Priority voice processing", "Tamil + English support"],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Campus",
    price: "₹999",
    tagline: "For teams & classrooms",
    features: ["Everything in Pro", "Up to 25 seats", "Shared study material library", "Group analytics", "Priority email support", "Custom voice profiles"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const faqs = [
  { q: "Can I switch plans anytime?", a: "Yes — upgrade or downgrade at any point. Changes apply at the next billing cycle." },
  { q: "Do you offer student discounts?", a: "Verified students get an additional 20% off the Pro plan. Just sign up with your campus email." },
  { q: "What languages are supported?", a: "Today, English and Tamil — both voice and text. More Indian languages are rolling out soon." },
  { q: "Is my data private?", a: "Always. Uploaded study material is private to your account and never used to train shared models." },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden pt-36 pb-12">
        <MeshBackground />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Pricing
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
              Simple, <span className="gradient-text">student-friendly</span> pricing
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Start free. Upgrade only when you're ready for more.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className={`relative h-full overflow-hidden p-8 ${p.highlight ? "border-primary/40 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-glow" : "border-border/50"}`}>
                {p.highlight && (
                  <div className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <div className="mt-6 font-display text-5xl font-bold">
                  {p.price}<span className="text-base font-normal text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />{b}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={p.highlight ? "hero" : "outline"} size="lg" className="mt-8 w-full rounded-full">
                  <Link to="/dashboard">{p.cta}</Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <Card key={f.q} className="border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <h3 className="text-base font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="hero" size="xl" className="rounded-full">
              <Link to="/dashboard">Start learning <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

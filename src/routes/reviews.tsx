import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Star, Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MeshBackground } from "@/components/visual/Backgrounds";
import { testimonials } from "@/lib/mock-data";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — LearnMate AI" },
      { name: "description", content: "See what students say about learning with LearnMate AI — real stories from learners across India and beyond." },
      { property: "og:title", content: "LearnMate AI Reviews" },
      { property: "og:description", content: "Loved by learners worldwide." },
    ],
  }),
  component: ReviewsPage,
});

const stats = [
  { value: "4.9/5", label: "Average rating" },
  { value: "25k+", label: "Active learners" },
  { value: "1.2M+", label: "Questions answered" },
  { value: "98%", label: "Would recommend" },
];

function ReviewsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden pt-36 pb-12">
        <MeshBackground />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Star className="h-3.5 w-3.5 fill-current" /> Reviews
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
              Loved by <span className="gradient-text">learners worldwide</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Real stories from students mastering new subjects with LearnMate AI.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm">
              <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...testimonials, ...testimonials].map((t, i) => (
              <motion.div
                key={`${t.name}-${i}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
              >
                <Card className="relative h-full border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                  <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/15" />
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

          <div className="mt-16 text-center">
            <Button asChild variant="hero" size="xl" className="rounded-full">
              <Link to="/dashboard">Join them today <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

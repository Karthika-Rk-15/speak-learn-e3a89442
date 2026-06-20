import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/visual/Logo";
import { ThemeToggle } from "@/components/visual/ThemeToggle";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/reviews", label: "Reviews" },
  { to: "/pricing", label: "Pricing" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-soft">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-sm text-foreground font-medium" }}
              >
                {l.label}
              </Link>
            ))}
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
  );
}

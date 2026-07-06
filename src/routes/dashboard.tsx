import { Link, Outlet, useRouterState, useNavigate, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard, Brain, Mic, FileText, ListChecks, BarChart3, User, Settings,
  Menu, X, Search, Bell, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/visual/Logo";
import { ThemeToggle } from "@/components/visual/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    // Keep session_id in sync for existing data-scoping code
    if (typeof window !== "undefined") {
      localStorage.setItem("learnmate_session_id", data.user.id);
      localStorage.setItem("learnmate.session_id", data.user.id);
    }
    return { userId: data.user.id, email: data.user.email };
  },
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/tutor", labelKey: "nav.tutor", icon: Brain },
  { to: "/dashboard/voice", labelKey: "nav.voice", icon: Mic },
  { to: "/dashboard/materials", labelKey: "nav.materials", icon: FileText },
  { to: "/dashboard/quiz", labelKey: "nav.quiz", icon: ListChecks },
  { to: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/dashboard/profile", labelKey: "nav.profile", icon: User },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
] as const;

function DashboardLayout() {
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { email, userId } = Route.useRouteContext();

  const initial = (email?.[0] || "U").toUpperCase();

  const handleLogout = async () => {
    localStorage.removeItem("learnmate_session_id");
    localStorage.removeItem("learnmate.session_id");
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
          collapsed ? "w-[76px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {collapsed ? <Logo size="sm" showText={false} /> : <Logo size="sm" />}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden rounded-lg p-1.5 text-muted-foreground hover:bg-accent/10 hover:text-foreground lg:block"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = isActive(item.to, "exact" in item ? (item as { exact?: boolean }).exact : false);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-primary/10"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
                {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                {active && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="m-3 rounded-2xl gradient-primary p-4 text-primary-foreground shadow-glow">
            <p className="text-sm font-semibold">{t("nav.upgrade")}</p>
            <p className="mt-1 text-xs opacity-90">{t("nav.upgrade.desc")}</p>
            <Button size="sm" className="mt-3 w-full bg-white text-primary hover:bg-white/90">{t("nav.upgrade.cta")}</Button>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className={cn("flex min-h-screen flex-1 flex-col transition-all duration-300", collapsed ? "lg:ml-[76px]" : "lg:ml-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("nav.search")} className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full" aria-label={t("nav.signout")} title={t("nav.signout")}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Link to="/dashboard/profile" title={email ?? userId} className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">{initial}</Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

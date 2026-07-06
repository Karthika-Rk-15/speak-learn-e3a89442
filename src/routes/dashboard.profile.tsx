import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LogOut, Loader2, FileText, ListChecks, MessageSquare, Mic, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Stats = {
  materials: number;
  quizzes: number;
  chats: number;
  voice: number;
  avgScore: number | null;
};

function ProfilePage() {
  const navigate = useNavigate();
  const t = useT();
  const { email, userId } = Route.useRouteContext();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ materials: 0, quizzes: 0, chats: 0, voice: 0, avgScore: null });
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        // Profile
        let { data: prof } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, created_at")
          .eq("id", userId)
          .maybeSingle();

        if (!prof) {
          // Backfill missing profile row
          const { data: inserted } = await supabase
            .from("profiles")
            .insert({ id: userId, display_name: email?.split("@")[0] ?? null })
            .select("id, display_name, avatar_url, created_at")
            .single();
          prof = inserted ?? null;
        }

        // Counts in parallel
        const [docsRes, quizAttemptsRes, chatsRes] = await Promise.all([
          supabase.from("documents").select("id", { count: "exact", head: true }).eq("session_id", userId),
          supabase.from("quiz_attempts").select("score, total", { count: "exact" }).eq("session_id", userId),
          supabase.from("chat_history").select("id", { count: "exact", head: true }).eq("session_id", userId),
        ]);

        const attempts = (quizAttemptsRes.data ?? []) as { score: number; total: number }[];
        const avgScore = attempts.length
          ? Math.round(
              (attempts.reduce((a, x) => a + (x.total > 0 ? x.score / x.total : 0), 0) / attempts.length) * 100,
            )
          : null;

        if (cancelled) return;
        setProfile(prof);
        setDisplayName(prof?.display_name ?? "");
        setAvatarUrl(prof?.avatar_url ?? "");
        setStats({
          materials: docsRes.count ?? 0,
          quizzes: quizAttemptsRes.count ?? 0,
          chats: chatsRes.count ?? 0,
          voice: 0,
          avgScore,
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, email]);

  const handleLogout = async () => {
    localStorage.removeItem("learnmate_session_id");
    localStorage.removeItem("learnmate.session_id");
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", userId)
      .select("id, display_name, avatar_url, created_at")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfile(data);
    setEditOpen(false);
    toast.success("Profile updated");
  };

  const nameOrEmail = profile?.display_name || email || "Learner";
  const initials = (profile?.display_name || email || "U")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("") || "U";
  const joined = profile?.created_at ? new Date(profile.created_at) : null;

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    { label: t("profile.stat.materials"), value: stats.materials, icon: FileText },
    { label: t("profile.stat.quizzes"), value: stats.quizzes, icon: ListChecks },
    { label: t("profile.stat.chats"), value: stats.chats, icon: MessageSquare },
    { label: t("profile.stat.voice"), value: stats.voice, icon: Mic },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/50 p-0">
        <div className="h-36 gradient-hero animate-gradient" />
        <div className="-mt-14 flex flex-col items-start gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-card gradient-primary text-4xl font-bold text-primary-foreground shadow-elegant">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={nameOrEmail} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 pt-2">
            <h1 className="font-display text-2xl font-bold">{nameOrEmail}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {joined && (
                <Badge variant="secondary" className="rounded-full">
                  Joined {joined.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </Badge>
              )}
              {stats.avgScore !== null && (
                <Badge variant="secondary" className="rounded-full">
                  Avg quiz score: {stats.avgScore}%
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setEditOpen(true)}>
              {t("profile.edit")}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="rounded-full">
              <LogOut className="mr-2 h-4 w-4" /> {t("nav.signout")}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-border/50 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{t("profile.analytics")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("profile.avg")}</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {stats.avgScore !== null ? `${stats.avgScore}%` : "0%"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("profile.total")}</p>
            <p className="mt-1 font-display text-2xl font-bold">{stats.quizzes}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("profile.docs")}</p>
            <p className="mt-1 font-display text-2xl font-bold">{stats.materials}</p>
          </div>
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name and avatar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to show initials.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

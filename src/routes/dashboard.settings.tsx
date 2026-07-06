import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme";
import { useI18n, useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Moon, Sun, Globe, Volume2, Bell, Shield, Loader2, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useI18n();
  const t = useT();

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const resetPwForm = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error(t("cp.err.required"));
      return;
    }
    if (newPw.length < 8) {
      toast.error(t("cp.err.length"));
      return;
    }
    if (newPw !== confirmPw) {
      toast.error(t("cp.err.match"));
      return;
    }
    if (newPw === currentPw) {
      toast.error(t("cp.err.same"));
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("Not signed in");

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPw,
      });
      if (signInError) {
        toast.error(t("cp.err.currentWrong"));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success(t("cp.success"));
      setPwOpen(false);
      resetPwForm();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not signed in");

      const sessionId = user.id;

      const [profileRes, docsRes, quizzesRes, attemptsRes, chatsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("documents").select("id, file_name, file_path, file_size, status, created_at").eq("session_id", sessionId),
        supabase.from("quizzes").select("*").eq("session_id", sessionId),
        supabase.from("quiz_attempts").select("*").eq("session_id", sessionId),
        supabase.from("chat_history").select("*").eq("session_id", sessionId),
      ]);

      const attempts = attemptsRes.data ?? [];
      const totalAttempts = attempts.length;
      const avgScore =
        totalAttempts > 0
          ? Math.round(
              (attempts.reduce((a, x: any) => a + (x.total > 0 ? x.score / x.total : 0), 0) /
                totalAttempts) *
                100,
            )
          : 0;

      const payload = {
        exported_at: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profileRes.data ?? null,
        documents: docsRes.data ?? [],
        quizzes: quizzesRes.data ?? [],
        quiz_attempts: attempts,
        chat_history: chatsRes.data ?? [],
        analytics: {
          total_documents: docsRes.data?.length ?? 0,
          total_quizzes: quizzesRes.data?.length ?? 0,
          total_attempts: totalAttempts,
          total_chats: chatsRes.data?.length ?? 0,
          average_score_percent: avgScore,
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learnmate-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t("export.success"));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? t("export.error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {t("settings.appearance")}
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
          <div>
            <Label className="text-sm font-medium">{t("settings.darkMode")}</Label>
            <p className="text-xs text-muted-foreground">{t("settings.darkMode.desc")}</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggle} />
        </div>
      </Card>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4" /> {t("settings.language")}
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">{t("settings.interfaceLang")}</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as "en" | "ta")}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm flex items-center gap-1.5"><Volume2 className="h-3.5 w-3.5" /> {t("settings.voice")}</Label>
            <Select defaultValue="aria">
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aria">Aria — Warm & friendly</SelectItem>
                <SelectItem value="kai">Kai — Clear & professional</SelectItem>
                <SelectItem value="meera">Meera — Native Tamil</SelectItem>
                <SelectItem value="leo">Leo — Energetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Bell className="h-4 w-4" /> {t("settings.notifications")}
        </div>
        <div className="space-y-3">
          {[
            { label: "Daily study reminder", desc: "Gentle nudge to keep your streak", on: true },
            { label: "Quiz results", desc: "Notify me when AI grades my quiz", on: true },
            { label: "New AI features", desc: "Be the first to try new tools", on: false },
            { label: "Weekly progress report", desc: "Sunday email with your stats", on: true },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked={n.on} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4" /> {t("settings.account")}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPwOpen(true)}>
            {t("settings.changePassword")}
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {t("settings.exportData")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast.info("Account deletion is coming soon. Contact support to remove your account.")}
          >
            {t("settings.deleteAccount")}
          </Button>
        </div>
      </Card>

      <Dialog
        open={pwOpen}
        onOpenChange={(o) => {
          setPwOpen(o);
          if (!o) resetPwForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cp.title")}</DialogTitle>
            <DialogDescription>{t("cp.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="currentPw">{t("cp.current")}</Label>
              <Input
                id="currentPw"
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPw">{t("cp.new")}</Label>
              <Input
                id="newPw"
                type="password"
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPw">{t("cp.confirm")}</Label>
              <Input
                id="confirmPw"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPwOpen(false);
                resetPwForm();
              }}
              disabled={saving}
            >
              {t("cp.cancel")}
            </Button>
            <Button onClick={handleChangePassword} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("cp.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

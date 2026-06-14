import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/lib/theme";
import { Moon, Sun, Globe, Volume2, Bell, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize LearnMate to fit how you learn.</p>
      </div>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
          <div>
            <Label className="text-sm font-medium">Dark Mode</Label>
            <p className="text-xs text-muted-foreground">Easier on your eyes during late-night study</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggle} />
        </div>
      </Card>

      <Card className="border-border/50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4" /> Language & Voice
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Interface Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm flex items-center gap-1.5"><Volume2 className="h-3.5 w-3.5" /> AI Voice</Label>
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
          <Bell className="h-4 w-4" /> Notifications
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
          <Shield className="h-4 w-4" /> Account
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Export My Data</Button>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
}

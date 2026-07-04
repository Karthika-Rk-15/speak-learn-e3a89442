import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { Brain, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Logo } from "@/components/visual/Logo";
import { supabase } from "@/integrations/supabase/client";
import { MeshBackground } from "@/components/visual/Backgrounds";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — LearnMate AI" },
      { name: "description", content: "Sign in or create your LearnMate AI account to start learning." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [mode, setMode] = useState<"auth" | "forgot">("auth");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: (search.redirect as string) || "/dashboard" });
    });
  }, [navigate, search.redirect]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="mb-6">
          <Logo />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="glass-strong border-border/50 p-6 shadow-soft">
            {mode === "forgot" ? (
              <ForgotForm onBack={() => setMode("auth")} />
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="font-display text-lg font-bold">Welcome to LearnMate</h1>
                    <p className="text-xs text-muted-foreground">Voice-powered AI learning</p>
                  </div>
                </div>
                <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign in</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="mt-5">
                    <SignInForm
                      redirect={(search.redirect as string) || "/dashboard"}
                      onForgot={() => setMode("forgot")}
                    />
                  </TabsContent>
                  <TabsContent value="signup" className="mt-5">
                    <SignUpForm
                      redirect={(search.redirect as string) || "/dashboard"}
                      onDone={() => setTab("signin")}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function SignInForm({ redirect, onForgot }: { redirect: string; onForgot: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.user) {
      localStorage.setItem("learnmate_session_id", data.user.id);
      localStorage.setItem("learnmate.session_id", data.user.id);
    }
    toast.success("Welcome back!");
    navigate({ to: redirect });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
      <Field icon={<Lock className="h-4 w-4" />} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
      <div className="flex justify-end">
        <button type="button" onClick={onForgot} className="text-xs text-muted-foreground hover:text-primary">
          Forgot password?
        </button>
      </div>
      <Button type="submit" variant="hero" className="w-full rounded-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Sign in <ArrowRight className="ml-1 h-4 w-4" /></>)}
      </Button>
    </form>
  );
}

function SignUpForm({ redirect, onDone }: { redirect: string; onDone: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.session && data.user) {
      localStorage.setItem("learnmate_session_id", data.user.id);
      localStorage.setItem("learnmate.session_id", data.user.id);
      toast.success("Account created!");
      navigate({ to: redirect });
    } else {
      toast.success("Check your email to confirm your account.");
      onDone();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
      <Field icon={<Lock className="h-4 w-4" />} label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" required />
      <Button type="submit" variant="hero" className="w-full rounded-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Create account <ArrowRight className="ml-1 h-4 w-4" /></>)}
      </Button>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent. Check your inbox.");
    onBack();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">Reset your password</h2>
        <p className="mt-1 text-xs text-muted-foreground">We'll email you a link to reset it.</p>
      </div>
      <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
      <Button type="submit" variant="hero" className="w-full rounded-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
      </Button>
      <button type="button" onClick={onBack} className="block w-full text-center text-xs text-muted-foreground hover:text-primary">
        Back to sign in
      </button>
    </form>
  );
}

function Field({
  icon, label, type, value, onChange, placeholder, required,
}: {
  icon: React.ReactNode; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-11 rounded-xl pl-9"
        />
      </div>
    </div>
  );
}

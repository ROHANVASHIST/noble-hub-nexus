import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Award, Mail, Lock, User, ArrowRight, Loader2, KeyRound, BookOpen, Globe, Brain, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/frontend/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema, signInSchema } from "@/backend/services/auth";
import { lovable } from "@/integrations/lovable/index";

const features = [
  { icon: BookOpen, title: "125+ Years of Discovery", desc: "Explore every Nobel Prize awarded since 1901" },
  { icon: Globe, title: "World-Class Research", desc: "Access lectures, papers & analytics from laureates worldwide" },
  { icon: Brain, title: "AI Research Copilot", desc: "Get intelligent insights powered by advanced AI models" },
  { icon: TrendingUp, title: "Personal Analytics", desc: "Track your learning journey with rich dashboards" },
];

const stats = [
  { value: "950+", label: "Laureates" },
  { value: "6", label: "Categories" },
  { value: "125+", label: "Years" },
  { value: "10K+", label: "Papers" },
];

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        toast({ title: "Password reset email sent", description: "Check your inbox for the reset link." });
        setMode("signin");
        return;
      }
      if (mode === "signup") {
        const validation = signUpSchema.safeParse({ email, password, displayName });
        if (!validation.success) {
          toast({ variant: "destructive", title: "Validation Error", description: validation.error.errors[0]?.message || "Invalid input." });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
          options: { data: { display_name: validation.data.displayName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email for the confirmation link." });
      } else {
        const validation = signInSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({ variant: "destructive", title: "Validation Error", description: validation.error.errors[0]?.message || "Invalid input." });
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email: validation.data.email, password: validation.data.password });
        if (error) throw new Error("Invalid email or password.");
        toast({ title: "Welcome back!", description: "You have successfully signed in." });
        navigate("/");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result?.error) throw result.error;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error connecting to Google", description: error.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--gold)/0.15)] via-background to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--gold)/0.08)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[hsl(var(--gold)/0.06)] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & title */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--gold))] flex items-center justify-center">
                <Award className="h-5 w-5 text-background" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground tracking-tight">NobelHub</span>
            </div>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              The world's most comprehensive Nobel Prize research & discovery platform
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="h-10 w-10 rounded-lg bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.2)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--gold)/0.2)] transition-colors">
                  <f.icon className="h-5 w-5 text-[hsl(var(--gold))]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex gap-6 mb-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-display font-bold text-[hsl(var(--gold))]">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-[hsl(var(--gold))]" />
              <span>Trusted by researchers, students & educators worldwide</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
          {/* Mobile-only header */}
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--gold))] flex items-center justify-center">
                <Award className="h-5 w-5 text-background" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">NobelHub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "forgot" ? "We'll send you a link to reset your password." : "Sign in to explore Nobel Prize history & research"}
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Albert Einstein" className="pl-10" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={100} autoComplete="name" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
                </div>
              </div>
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                  </div>
                  {mode === "signup" && <p className="text-xs text-muted-foreground">Minimum 8 characters</p>}
                </div>
              )}
              <Button type="submit" className="w-full h-11 bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.9)] text-background font-semibold" disabled={loading || googleLoading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    {mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
                    {mode === "forgot" ? <KeyRound className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                  </>
                )}
              </Button>
            </form>

            {mode === "signin" && (
              <div className="mt-2 text-right">
                <button type="button" onClick={() => setMode("forgot")} className="text-xs text-[hsl(var(--gold))] hover:underline">
                  Forgot your password?
                </button>
              </div>
            )}

            {mode !== "forgot" && (
              <>
                <div className="mt-6 flex items-center justify-between">
                  <span className="w-1/5 border-b border-border/50 lg:w-1/4" />
                  <span className="text-xs text-center text-muted-foreground uppercase tracking-widest font-bold">or</span>
                  <span className="w-1/5 border-b border-border/50 lg:w-1/4" />
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full h-11 border-border/50 font-semibold" disabled={loading || googleLoading} onClick={handleGoogleAuth} type="button">
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    )}
                    Continue with Google
                  </Button>
                </div>
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account?" : mode === "forgot" ? "Remember your password?" : "Don't have an account?"}{" "}
                <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")} className="text-[hsl(var(--gold))] font-semibold hover:underline">
                  {mode === "signup" ? "Sign In" : mode === "forgot" ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          {/* Mobile-only features preview */}
          <div className="lg:hidden flex justify-center gap-6 pt-2">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-display font-bold text-[hsl(var(--gold))]">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

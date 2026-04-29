import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Award, Mail, Lock, User, ArrowRight, Loader2, KeyRound,
  BookOpen, Globe, Brain, TrendingUp, Sparkles, Search, Network,
  GraduationCap, FileText, BarChart3, MessagesSquare, Quote,
  Check, Star, Zap, Shield, Users, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/frontend/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema, signInSchema } from "@/backend/services/auth";
import { lovable } from "@/integrations/lovable/index";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { value: "950+", label: "Laureates" },
  { value: "125+", label: "Years" },
  { value: "10K+", label: "Papers" },
  { value: "16", label: "AI Tools" },
];

const features = [
  { icon: BookOpen, title: "Complete Nobel Archive", desc: "Every laureate, lecture, and paper since 1901 — searchable, cross-referenced, and beautifully presented." },
  { icon: Brain, title: "AI Research Copilot", desc: "Gemini-powered assistant that drafts, summarizes, finds gaps, and reasons across 125 years of discovery." },
  { icon: Network, title: "Knowledge Graph", desc: "Visualize collaborations, mentorships, and ideological lineages across disciplines and decades." },
  { icon: GraduationCap, title: "Scholar Workspace", desc: "Digital lab notebook, kanban planner, citation generator, and Pomodoro deep-focus mode." },
  { icon: Search, title: "Live Academic Search", desc: "Query arXiv, Semantic Scholar, OpenAlex, Crossref, PubMed, and DOAJ from one unified interface." },
  { icon: BarChart3, title: "Personal Analytics", desc: "90-day heatmaps, skill radars, and progression metrics that turn study into measurable craft." },
];

const tools = [
  "Semantic Search", "Gap Analysis", "Literature Review", "Citation Generator",
  "Methodology Critique", "Hypothesis Builder", "Time Machine", "Impact Simulator",
  "Six Degrees Mapper", "Oracle Predictions", "Voice Studio", "Deep Focus Editor",
];

const testimonials = [
  { quote: "It's the research environment I wish I'd had during my PhD. Genuinely changes how you read papers.", author: "Dr. Amelia Chen", role: "Postdoc, Molecular Biology" },
  { quote: "The knowledge graph connected three laureates I'd never linked. That's a publication right there.", author: "Marcus Vidal", role: "History of Science" },
  { quote: "Finally a study app that respects how researchers actually think. The AI is shockingly good.", author: "Priya Raman", role: "Graduate Student, Physics" },
];

const Landing = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
  }, []);

  const scrollToAuth = () => authRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

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
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result?.error) throw result.error;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error connecting to Google", description: error.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ===== Top Nav ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[hsl(var(--gold))] flex items-center justify-center shadow-[0_0_20px_-2px_hsl(var(--gold)/0.5)]">
              <Award className="h-4.5 w-4.5 text-background" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight">NobelHub</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#tools" className="hover:text-foreground transition-colors">Tools</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Access</a>
          </div>
          <Button
            onClick={scrollToAuth}
            className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.9)] text-background font-semibold h-9 px-4"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section ref={heroRef} className="relative pt-32 pb-24 lg:pt-40 lg:pb-32">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[hsl(var(--gold)/0.12)] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] bg-[hsl(var(--gold)/0.08)] rounded-full blur-[100px]" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr,1fr] gap-12 lg:gap-16 items-center">
          {/* Left: pitch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.05)] text-xs font-medium text-[hsl(var(--gold))] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              The research platform built for serious scholars
            </div>
            <h1 className="font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.05]">
              125 years of <br />
              <span className="text-gradient-gold">human brilliance,</span> <br />
              one workspace.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              NobelHub fuses the complete Nobel Prize archive with an AI-native research workspace —
              copilot, knowledge graph, scholar tools, and live academic search across six databases.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => { setMode("signup"); scrollToAuth(); }}
                size="lg"
                className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.9)] text-background font-semibold h-12 px-6 shadow-[0_8px_30px_-8px_hsl(var(--gold)/0.6)]"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={scrollToAuth}
                variant="outline"
                size="lg"
                className="h-12 px-6 border-border/60"
              >
                Sign in
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-4 gap-6 max-w-lg">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="text-2xl lg:text-3xl font-display font-bold text-[hsl(var(--gold))]">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Auth card */}
          <motion.div
            ref={authRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-[hsl(var(--gold)/0.2)] to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-7 shadow-2xl">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--gold))] mb-2">
                  <Zap className="h-3.5 w-3.5" />
                  {mode === "signup" ? "Free forever" : "Welcome back"}
                </div>
                <h2 className="text-2xl font-display font-bold">
                  {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Sign in to NobelHub"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {mode === "forgot" ? "We'll email you a secure reset link." : "No credit card required. Two clicks with Google."}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 border-border/60 font-semibold mb-4"
                disabled={loading || googleLoading}
                onClick={handleGoogleAuth}
                type="button"
              >
                {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                )}
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">or email</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              <form onSubmit={handleAuth} className="space-y-3.5">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs">Display name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="name" placeholder="Marie Curie" className="pl-10 h-10" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={100} autoComplete="name" />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="name@example.com" className="pl-10 h-10" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
                  </div>
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-[11px] text-[hsl(var(--gold))] hover:underline">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.9)] text-background font-semibold mt-1"
                  disabled={loading || googleLoading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                      {mode === "signup" ? "Create free account" : mode === "forgot" ? "Send reset link" : "Sign in"}
                      {mode === "forgot" ? <KeyRound className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account?" : mode === "forgot" ? "Remember your password?" : "New to NobelHub?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")}
                  className="text-[hsl(var(--gold))] font-semibold hover:underline"
                >
                  {mode === "signup" ? "Sign in" : mode === "forgot" ? "Sign in" : "Create account"}
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Encrypted</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3" /> GDPR-ready</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Free forever</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] uppercase tracking-widest">Discover</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </section>

      {/* ===== Logo strip / trust ===== */}
      <section className="border-y border-border/40 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="opacity-70">Indexes data from</span>
          <span className="font-semibold text-foreground/70">arXiv</span>
          <span className="font-semibold text-foreground/70">Semantic Scholar</span>
          <span className="font-semibold text-foreground/70">OpenAlex</span>
          <span className="font-semibold text-foreground/70">Crossref</span>
          <span className="font-semibold text-foreground/70">PubMed</span>
          <span className="font-semibold text-foreground/70">DOAJ</span>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-[hsl(var(--gold))] font-bold mb-3">Capabilities</div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight">
              A complete research environment, not another search box.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Six pillars working in concert — each one would justify a standalone product.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-card/60 border border-border/50 rounded-2xl p-6 hover:border-[hsl(var(--gold)/0.4)] transition-all hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.2)] flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--gold)/0.2)] transition-colors">
                  <f.icon className="h-5 w-5 text-[hsl(var(--gold))]" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tool gallery ===== */}
      <section id="tools" className="py-24 lg:py-32 bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr,1.2fr] gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-xs uppercase tracking-widest text-[hsl(var(--gold))] font-bold mb-3">Scholar OS</div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight mb-5">
              16 AI tools, one keyboard shortcut.
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Press <kbd className="px-2 py-1 rounded-md bg-background border border-border text-xs font-mono">⌘K</kbd> from anywhere to summon semantic search,
              gap analysis, methodology critique, the Time Machine, and a dozen more — each
              tuned for publication-grade depth.
            </p>
            <Button
              onClick={() => { setMode("signup"); scrollToAuth(); }}
              className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.9)] text-background font-semibold h-11 px-5"
            >
              Try the workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {tools.map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="px-4 py-3 rounded-xl bg-background border border-border/50 hover:border-[hsl(var(--gold)/0.4)] hover:bg-[hsl(var(--gold)/0.05)] transition-all text-sm font-medium text-center"
              >
                {t}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="text-xs uppercase tracking-widest text-[hsl(var(--gold))] font-bold mb-3">Loved by researchers</div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight">
              Built with scholars, for scholars.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/60 border border-border/50 rounded-2xl p-6 relative"
              >
                <Quote className="absolute top-5 right-5 h-6 w-6 text-[hsl(var(--gold)/0.2)]" />
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="border-t border-border/40 pt-4">
                  <div className="text-sm font-semibold">{t.author}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing / final CTA ===== */}
      <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--gold)/0.08)] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--gold)/0.06)] rounded-full blur-[120px]" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.05)] text-xs font-medium text-[hsl(var(--gold))] mb-6">
              <Users className="h-3.5 w-3.5" />
              Free for individual researchers
            </div>
            <h2 className="text-4xl lg:text-6xl font-display font-bold tracking-tight">
              Begin your <span className="text-gradient-gold">life's work</span>.
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto">
              Two clicks with Google. No card. No trial timer. Everything you've seen, available the moment you sign in.
            </p>
            <Button
              onClick={() => { setMode("signup"); scrollToAuth(); }}
              size="lg"
              className="mt-8 bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.9)] text-background font-semibold h-12 px-8 shadow-[0_8px_30px_-8px_hsl(var(--gold)/0.6)]"
            >
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/40 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[hsl(var(--gold))] flex items-center justify-center">
              <Award className="h-3 w-3 text-background" />
            </div>
            <span className="font-display font-semibold text-foreground">NobelHub</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

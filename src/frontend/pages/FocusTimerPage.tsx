import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Timer, Play, Pause, RotateCcw, Coffee, Flame, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const PRESETS = [
  { label: "Deep Focus", work: 50, break: 10, icon: "🧠" },
  { label: "Pomodoro", work: 25, break: 5, icon: "🍅" },
  { label: "Sprint", work: 15, break: 3, icon: "⚡" },
  { label: "Long Read", work: 90, break: 15, icon: "📚" },
];

const FocusTimerPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalSeconds = isBreak ? breakMin * 60 : workMin * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const { data: todaySessions = 0 } = useQuery({
    queryKey: ["focus-sessions-today", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("user_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("action", "focus_session")
        .gte("created_at", today);
      return data?.length || 0;
    },
    enabled: !!user,
  });

  const logSession = useMutation({
    mutationFn: async (minutes: number) => {
      if (!user) return;
      await supabase.from("user_activity").insert({
        user_id: user.id,
        action: "focus_session",
        item_type: "timer",
        metadata: { minutes, type: isBreak ? "break" : "work" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["focus-sessions-today"] }),
  });

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (!isBreak) {
      setSessionsCompleted(s => s + 1);
      logSession.mutate(workMin);
      toast.success(`🎉 Focus session complete! Time for a ${breakMin}-min break.`);
      setIsBreak(true);
      setTimeLeft(breakMin * 60);
    } else {
      toast.success("Break over! Ready for another session?");
      setIsBreak(false);
      setTimeLeft(workMin * 60);
    }
  }, [isBreak, workMin, breakMin, logSession]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleComplete(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft, handleComplete]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const selectPreset = (p: typeof PRESETS[0]) => {
    setIsRunning(false);
    setIsBreak(false);
    setWorkMin(p.work);
    setBreakMin(p.break);
    setTimeLeft(p.work * 60);
  };

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMin * 60);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Focus Timer</h1>
              <p className="text-sm text-muted-foreground">Deep work sessions to boost your research productivity.</p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="rounded-3xl border border-border bg-card/50 p-8 text-center mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {isBreak ? (
                  <span className="flex items-center justify-center gap-1"><Coffee className="h-3 w-3" /> Break Time</span>
                ) : (
                  <span className="flex items-center justify-center gap-1"><Flame className="h-3 w-3 text-primary" /> Focus Mode</span>
                )}
              </p>
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                className="text-7xl md:text-8xl font-display font-black text-foreground tabular-nums tracking-tight"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <Progress value={progress} className="h-2 mt-6 max-w-sm mx-auto" />
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  size="lg"
                  className="rounded-2xl h-14 px-8 gap-2 text-sm font-bold"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  size="lg"
                  className="rounded-2xl h-14 px-6 gap-2 text-sm"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className={`p-4 rounded-2xl border text-center transition-all hover:border-primary/30 ${
                  workMin === p.work && breakMin === p.break
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/50"
                }`}
              >
                <span className="text-2xl block">{p.icon}</span>
                <p className="text-xs font-bold text-foreground mt-2">{p.label}</p>
                <p className="text-[10px] text-muted-foreground">{p.work}m / {p.break}m break</p>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-card/50 text-center">
              <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{sessionsCompleted}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">This Session</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/50 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{todaySessions}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Today</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/50 text-center">
              <Flame className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{sessionsCompleted * workMin + todaySessions * 25}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Minutes</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FocusTimerPage;

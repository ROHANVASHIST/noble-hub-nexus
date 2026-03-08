import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Maximize2, Minimize2, Play, Pause, RotateCcw, Volume2, VolumeX,
  Target, Clock, Save, TreePine, Waves, Wind, Cloud,
  Coffee, Flame, Music, Zap, ChevronUp, BarChart3,
} from "lucide-react";

// ── Ambient Soundscapes ──
const SOUNDSCAPES = [
  { id: "silence", label: "Silence", icon: VolumeX, color: "text-muted-foreground" },
  { id: "rain", label: "Rain", icon: Cloud, color: "text-blue-400" },
  { id: "forest", label: "Forest", icon: TreePine, color: "text-green-400" },
  { id: "ocean", label: "Ocean", icon: Waves, color: "text-cyan-400" },
  { id: "wind", label: "Wind", icon: Wind, color: "text-slate-400" },
  { id: "fire", label: "Fireplace", icon: Flame, color: "text-orange-400" },
  { id: "cafe", label: "Café", icon: Coffee, color: "text-amber-400" },
  { id: "lofi", label: "Lo-fi", icon: Music, color: "text-purple-400" },
];

const PRESETS = [
  { label: "Sprint", minutes: 25, goal: 500 },
  { label: "Deep Work", minutes: 50, goal: 1000 },
  { label: "Marathon", minutes: 90, goal: 2000 },
  { label: "Free Flow", minutes: 0, goal: 0 },
];

// ── Noise generator using Web Audio API ──
function useAmbientNoise() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);
  const [active, setActive] = useState<string>("silence");
  const [volume, setVolume] = useState(0.3);

  const stop = useCallback(() => {
    nodesRef.current.forEach(n => { try { (n as any).stop?.(); n.disconnect(); } catch {} });
    nodesRef.current = [];
  }, []);

  const play = useCallback((id: string) => {
    setActive(id);
    stop();
    if (id === "silence") return;

    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    // Generate colored noise variants for different soundscapes
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    const seeds: Record<string, () => void> = {
      rain: () => { for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4; },
      forest: () => {
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + w * 0.01; b1 = 0.98 * b1 + w * 0.02; b2 = 0.97 * b2 + w * 0.03;
          data[i] = (b0 + b1 + b2) * 2;
        }
      },
      ocean: () => {
        for (let i = 0; i < bufferSize; i++) {
          const t = i / ctx.sampleRate;
          data[i] = (Math.random() * 2 - 1) * 0.3 * (0.5 + 0.5 * Math.sin(t * 0.15 * Math.PI));
        }
      },
      wind: () => {
        let b = 0;
        for (let i = 0; i < bufferSize; i++) { b = 0.995 * b + (Math.random() * 2 - 1) * 0.005; data[i] = b * 15; }
      },
      fire: () => {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.25 * (0.7 + 0.3 * Math.sin(i * 0.00003));
        }
      },
      cafe: () => {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15 + Math.sin(i * 0.001) * 0.05;
        }
      },
      lofi: () => {
        let b0 = 0;
        for (let i = 0; i < bufferSize; i++) {
          b0 = 0.99 * b0 + (Math.random() * 2 - 1) * 0.01;
          data[i] = b0 * 8 + Math.sin(i * 0.0002) * 0.1;
        }
      },
    };

    (seeds[id] || seeds.rain)();

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Add EQ filter for character
    const filter = ctx.createBiquadFilter();
    filter.type = id === "wind" || id === "lofi" ? "lowpass" : "bandpass";
    filter.frequency.value = id === "ocean" ? 400 : id === "forest" ? 800 : id === "lofi" ? 600 : 1200;
    filter.Q.value = 0.5;

    src.connect(filter);
    filter.connect(gain);
    src.start();

    nodesRef.current = [src, filter, gain];
  }, [volume, stop]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => () => { stop(); ctxRef.current?.close(); }, [stop]);

  return { active, play, volume, setVolume, stop };
}

const DeepFocusPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // ── State ──
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [text, setText] = useState("");
  const [wordGoal, setWordGoal] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalWordsWritten, setTotalWordsWritten] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ambient = useAmbientNoise();

  // ── Derived ──
  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);
  const charCount = text.length;
  const goalProgress = wordGoal > 0 ? Math.min(100, (wordCount / wordGoal) * 100) : 0;
  const timerProgress = timerMinutes > 0 ? ((timerMinutes * 60 - timeLeft) / (timerMinutes * 60)) * 100 : 0;

  // ── Timer ──
  useEffect(() => {
    if (!isRunning || timerMinutes === 0) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          setSessionsCompleted(s => s + 1);
          setTotalWordsWritten(w => w + wordCount);
          toast.success("Session complete! Great focus work 🎯");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, timerMinutes, wordCount]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const startSession = () => {
    if (!isRunning && timeLeft === 0) setTimeLeft(timerMinutes * 60);
    setIsRunning(true);
    if (!sessionStart) setSessionStart(new Date());
  };

  const selectPreset = (p: typeof PRESETS[0]) => {
    setTimerMinutes(p.minutes);
    setTimeLeft(p.minutes * 60);
    setWordGoal(p.goal);
    setIsRunning(false);
  };

  // ── Fullscreen ──
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Save to notes ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !text.trim()) return;
      const { error } = await supabase.from("scholar_notes").insert({
        user_id: user.id,
        title: title || `Focus Session – ${new Date().toLocaleDateString()}`,
        content: text,
        type: "note",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scholar-notes"] });
      toast.success("Saved to your notes!");
    },
    onError: () => toast.error("Failed to save"),
  });

  // ── Log session ──
  const logSession = useMutation({
    mutationFn: async () => {
      if (!user || !sessionStart) return;
      const mins = Math.round((Date.now() - sessionStart.getTime()) / 60000);
      await supabase.from("user_activity").insert({
        user_id: user.id,
        action: "focus_session",
        metadata: { minutes: mins, words: wordCount, mode: "deep_focus" },
      });
    },
  });

  // ── Keyboard shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (text.trim()) saveMutation.mutate();
      }
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [text, isFullscreen]);

  const sessionMinutes = sessionStart ? Math.round((Date.now() - sessionStart.getTime()) / 60000) : 0;

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-10"
      >
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Deep Focus</span>
          {isRunning && (
            <Badge variant="secondary" className="animate-pulse text-xs">
              <span className="mr-1">●</span> In Session
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Timer display */}
          {timerMinutes > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm font-bold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Word count */}
          <Badge variant="outline" className="text-xs font-mono">
            {wordCount}{wordGoal > 0 ? `/${wordGoal}` : ""} words
          </Badge>

          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowStats(s => !s)}>
            {showStats ? <ChevronUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          </Button>

          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {/* ── Stats panel ── */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-muted/30"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Words</p>
                <p className="text-lg font-bold text-foreground">{wordCount}</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Characters</p>
                <p className="text-lg font-bold text-foreground">{charCount}</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Session</p>
                <p className="text-lg font-bold text-foreground">{sessionMinutes}m</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-bold text-foreground">{sessionsCompleted}</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Words</p>
                <p className="text-lg font-bold text-foreground">{totalWordsWritten + wordCount}</p>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bars ── */}
      <div className="px-4 py-1.5 flex gap-4 items-center bg-muted/20">
        {wordGoal > 0 && (
          <div className="flex-1 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            <Progress value={goalProgress} className="h-1.5 flex-1" />
            <span className="text-[10px] text-muted-foreground font-mono">{Math.round(goalProgress)}%</span>
          </div>
        )}
        {timerMinutes > 0 && (
          <div className="flex-1 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <Progress value={timerProgress} className="h-1.5 flex-1" />
            <span className="text-[10px] text-muted-foreground font-mono">{Math.round(timerProgress)}%</span>
          </div>
        )}
      </div>

      {/* ── Main writing area ── */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-4">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled focus session…"
            className="text-xl font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40"
          />
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Start writing. Let ideas flow freely…"
            className="min-h-[50vh] text-base leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 resize-none px-0 placeholder:text-muted-foreground/30"
          />
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3"
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3 justify-between">
          {/* Presets */}
          <div className="flex items-center gap-1.5">
            {PRESETS.map(p => (
              <Button
                key={p.label}
                size="sm"
                variant={timerMinutes === p.minutes && wordGoal === p.goal ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => selectPreset(p)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => isRunning ? setIsRunning(false) : startSession()}>
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setTimeLeft(timerMinutes * 60); setIsRunning(false); }}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          {/* Soundscape */}
          <div className="flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {SOUNDSCAPES.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => ambient.play(s.id)}
                  className={`p-1.5 rounded-md transition-all ${
                    ambient.active === s.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted"
                  }`}
                  title={s.label}
                >
                  <Icon className={`h-3.5 w-3.5 ${ambient.active === s.id ? s.color : "text-muted-foreground"}`} />
                </button>
              );
            })}
            {ambient.active !== "silence" && (
              <Slider
                value={[ambient.volume * 100]}
                onValueChange={([v]) => ambient.setVolume(v / 100)}
                max={100}
                step={5}
                className="w-16 ml-1"
              />
            )}
          </div>

          {/* Save */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              disabled={!text.trim() || saveMutation.isPending}
              onClick={() => {
                saveMutation.mutate();
                logSession.mutate();
              }}
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
            <span className="text-[10px] text-muted-foreground hidden md:inline">⌘S</span>
          </div>
        </div>
      </motion.div>

      {/* ── Word goal reached celebration ── */}
      <AnimatePresence>
        {wordGoal > 0 && wordCount >= wordGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="text-6xl">🎯</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeepFocusPage;

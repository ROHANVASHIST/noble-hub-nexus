import { useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { useAuth } from "@/App";
import { useScholarData } from "@/frontend/hooks/useScholarData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Flame, Award, BookOpen, Brain, Target, Zap, Medal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000];
const LEVEL_NAMES = [
  "Novice Scholar", "Curious Mind", "Knowledge Seeker", "Research Apprentice",
  "Lab Associate", "Senior Researcher", "Lead Scientist", "Distinguished Scholar",
  "Nobel Candidate", "Nobel Fellow", "Nobel Grandmaster",
];

const XP_VALUES = {
  note: 10,
  insight: 20,
  breakthrough: 50,
  project: 30,
  bookmark: 5,
  tracker_entry: 8,
  quiz_correct: 15,
};

const LeaderboardPage = () => {
  const { user } = useAuth();
  const { notes, projects, bookmarks } = useScholarData();

  const { data: trackerEntries = 0 } = useQuery({
    queryKey: ["tracker-xp", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("user_trackers")
        .select("entries")
        .eq("user_id", user.id);
      return (data || []).reduce((sum, t: any) => {
        const entries = Array.isArray(t.entries) ? t.entries : [];
        return sum + entries.length;
      }, 0);
    },
    enabled: !!user,
  });

  const xpBreakdown = useMemo(() => {
    const noteXP = notes.filter(n => n.type === "note").length * XP_VALUES.note;
    const insightXP = notes.filter(n => n.type === "insight").length * XP_VALUES.insight;
    const breakthroughXP = notes.filter(n => n.type === "breakthrough").length * XP_VALUES.breakthrough;
    const projectXP = projects.length * XP_VALUES.project;
    const bookmarkXP = bookmarks.length * XP_VALUES.bookmark;
    const trackerXP = trackerEntries * XP_VALUES.tracker_entry;
    const total = noteXP + insightXP + breakthroughXP + projectXP + bookmarkXP + trackerXP;
    return { noteXP, insightXP, breakthroughXP, projectXP, bookmarkXP, trackerXP, total };
  }, [notes, projects, bookmarks, trackerEntries]);

  const level = useMemo(() => {
    let lvl = 0;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xpBreakdown.total >= LEVEL_THRESHOLDS[i]) { lvl = i; break; }
    }
    const nextThreshold = LEVEL_THRESHOLDS[Math.min(lvl + 1, LEVEL_THRESHOLDS.length - 1)];
    const currentThreshold = LEVEL_THRESHOLDS[lvl];
    const progress = nextThreshold > currentThreshold
      ? ((xpBreakdown.total - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;
    return { level: lvl, name: LEVEL_NAMES[lvl], progress, xpToNext: nextThreshold - xpBreakdown.total };
  }, [xpBreakdown.total]);

  const achievements = useMemo(() => [
    { label: "First Note", desc: "Write your first note", earned: notes.length >= 1, icon: BookOpen },
    { label: "5 Notes", desc: "Write 5 notes", earned: notes.length >= 5, icon: BookOpen },
    { label: "Researcher", desc: "Start a research project", earned: projects.length >= 1, icon: Brain },
    { label: "3 Projects", desc: "Start 3 projects", earned: projects.length >= 3, icon: Brain },
    { label: "Collector", desc: "Bookmark 5 items", earned: bookmarks.length >= 5, icon: Star },
    { label: "Tracker Pro", desc: "Log 10 tracker entries", earned: trackerEntries >= 10, icon: Target },
    { label: "Breakthrough", desc: "Record a breakthrough", earned: notes.some(n => n.type === "breakthrough"), icon: Zap },
    { label: "Centurion", desc: "Reach 100 XP", earned: xpBreakdown.total >= 100, icon: Trophy },
    { label: "Scholar Elite", desc: "Reach 500 XP", earned: xpBreakdown.total >= 500, icon: Medal },
    { label: "Grandmaster", desc: "Reach 1000 XP", earned: xpBreakdown.total >= 1000, icon: Award },
  ], [notes, projects, bookmarks, trackerEntries, xpBreakdown.total]);

  const earnedCount = achievements.filter(a => a.earned).length;

  const xpSources = [
    { label: "Notes", xp: xpBreakdown.noteXP, color: "bg-primary" },
    { label: "Insights", xp: xpBreakdown.insightXP, color: "bg-accent" },
    { label: "Breakthroughs", xp: xpBreakdown.breakthroughXP, color: "bg-destructive" },
    { label: "Projects", xp: xpBreakdown.projectXP, color: "bg-chart-3" },
    { label: "Bookmarks", xp: xpBreakdown.bookmarkXP, color: "bg-chart-4" },
    { label: "Tracker", xp: xpBreakdown.trackerXP, color: "bg-chart-5" },
  ].filter(s => s.xp > 0);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Leaderboard & XP</h1>
              <p className="text-sm text-muted-foreground">Track your progress and earn achievements.</p>
            </div>
          </div>

          {/* Level Card */}
          <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-display font-black text-primary">
                {level.level}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{level.name}</h2>
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-bold">{xpBreakdown.total} XP</span>
                  {level.xpToNext > 0 && <> · {level.xpToNext} XP to next level</>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-foreground">{earnedCount}/{achievements.length}</span>
              </div>
            </div>
            <Progress value={level.progress} className="h-3" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* XP Breakdown */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">XP Sources</h3>
              {xpSources.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Start exploring to earn XP!</p>
              ) : (
                xpSources.map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${s.color}`} />
                    <span className="text-sm text-foreground flex-1">{s.label}</span>
                    <span className="text-sm font-bold text-primary">{s.xp} XP</span>
                  </div>
                ))
              )}
            </div>

            {/* Achievements */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                Achievements ({earnedCount}/{achievements.length})
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {achievements.map(a => (
                  <div
                    key={a.label}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      a.earned
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-muted/10 opacity-50"
                    }`}
                  >
                    <a.icon className={`h-4 w-4 shrink-0 ${a.earned ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                    </div>
                    {a.earned && <Star className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* XP Guide */}
          <div className="mt-8 p-5 rounded-2xl border border-border bg-card/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-3">How to Earn XP</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(XP_VALUES).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20">
                  <span className="text-primary font-bold text-sm">+{val}</span>
                  <span className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default LeaderboardPage;

import { useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Award, Flame, BookOpen, Brain, Target, Zap, Trophy, Star, Clock, Layers } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: typeof Award;
  color: string;
  threshold: number;
  metric: string;
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_note", title: "First Insight", description: "Write your first note", icon: BookOpen, color: "text-blue-500", threshold: 1, metric: "notes" },
  { id: "note_10", title: "Prolific Writer", description: "Write 10 notes", icon: BookOpen, color: "text-blue-600", threshold: 10, metric: "notes" },
  { id: "note_50", title: "Knowledge Architect", description: "Write 50 notes", icon: Brain, color: "text-purple-500", threshold: 50, metric: "notes" },
  { id: "first_focus", title: "Deep Diver", description: "Complete your first focus session", icon: Clock, color: "text-green-500", threshold: 1, metric: "focus" },
  { id: "focus_10", title: "Focus Master", description: "Complete 10 focus sessions", icon: Zap, color: "text-yellow-500", threshold: 10, metric: "focus" },
  { id: "focus_50", title: "Zen Scholar", description: "Complete 50 focus sessions", icon: Flame, color: "text-orange-500", threshold: 50, metric: "focus" },
  { id: "first_bookmark", title: "Curator", description: "Save your first bookmark", icon: Star, color: "text-pink-500", threshold: 1, metric: "bookmarks" },
  { id: "bookmark_20", title: "Library Builder", description: "Save 20 bookmarks", icon: Layers, color: "text-indigo-500", threshold: 20, metric: "bookmarks" },
  { id: "streak_3", title: "Consistent", description: "Maintain a 3-day activity streak", icon: Flame, color: "text-orange-400", threshold: 3, metric: "streak" },
  { id: "streak_7", title: "Weekly Warrior", description: "Maintain a 7-day streak", icon: Flame, color: "text-red-500", threshold: 7, metric: "streak" },
  { id: "streak_30", title: "Monthly Legend", description: "Maintain a 30-day streak", icon: Trophy, color: "text-amber-500", threshold: 30, metric: "streak" },
  { id: "goals_5", title: "Goal Getter", description: "Complete 5 daily goals", icon: Target, color: "text-emerald-500", threshold: 5, metric: "goals" },
  { id: "goals_25", title: "Achiever", description: "Complete 25 daily goals", icon: Award, color: "text-teal-500", threshold: 25, metric: "goals" },
];

const AchievementsPage = () => {
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ["achievements-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("user_activity").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1000);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: notesCount = 0 } = useQuery({
    queryKey: ["achievements-notes", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await (supabase as any).from("scholar_notes").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: bookmarksCount = 0 } = useQuery({
    queryKey: ["achievements-bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const metrics = useMemo(() => {
    const focus = activities.filter(a => a.action === "focus_session").length;
    const goals = activities.filter(a => a.action === "daily_goal" && (a.metadata as any)?.completed).length;

    // Streak calculation
    const activeDays = new Set(activities.map(a => a.created_at.split("T")[0]));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (activeDays.has(d.toISOString().split("T")[0])) streak++;
      else if (i > 0) break;
    }

    return { notes: notesCount, focus, bookmarks: bookmarksCount, streak, goals };
  }, [activities, notesCount, bookmarksCount]);

  const evaluated = ACHIEVEMENTS.map(a => {
    const current = (metrics as any)[a.metric] || 0;
    const progress = Math.min(100, Math.round((current / a.threshold) * 100));
    const unlocked = current >= a.threshold;
    return { ...a, current, progress, unlocked };
  });

  const unlocked = evaluated.filter(a => a.unlocked).length;
  const total = evaluated.length;
  const xp = evaluated.reduce((sum, a) => sum + (a.unlocked ? a.threshold * 10 : 0), 0);
  const level = Math.floor(xp / 100) + 1;

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" /> Achievements
          </h1>
          <p className="text-muted-foreground mt-1">Track milestones and earn badges as you learn and research.</p>
        </motion.div>

        {/* Level Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="py-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">L{level}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Level {level} Scholar</h2>
                  <p className="text-sm text-muted-foreground">{xp} XP · {unlocked}/{total} badges unlocked</p>
                  <Progress value={(unlocked / total) * 100} className="mt-2 h-2" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{unlocked}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluated.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`transition-all ${a.unlocked ? "border-primary/30 shadow-sm" : "opacity-60"}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${a.unlocked ? "bg-primary/10" : "bg-muted"}`}>
                      <a.icon className={`h-5 w-5 ${a.unlocked ? a.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                        {a.unlocked && <Badge variant="default" className="text-[10px] px-1.5 py-0">✓</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      <div className="mt-2">
                        <Progress value={a.progress} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground">{a.current}/{a.threshold}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default AchievementsPage;

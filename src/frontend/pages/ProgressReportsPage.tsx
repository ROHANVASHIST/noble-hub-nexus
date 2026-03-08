import { useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { useAuth } from "@/App";
import { useScholarData } from "@/frontend/hooks/useScholarData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, BookOpen, Brain, Target, Flame, Clock, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ProgressReportsPage = () => {
  const { user } = useAuth();
  const { notes, projects, bookmarks } = useScholarData();

  const { data: activityData = [] } = useQuery({
    queryKey: ["weekly-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from("user_activity")
        .select("action, created_at")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString());
      return data || [];
    },
    enabled: !!user,
  });

  const { data: trackerData = [] } = useQuery({
    queryKey: ["weekly-trackers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_trackers")
        .select("tracker_name, entries")
        .eq("user_id", user.id);
      return (data || []).map((t: any) => ({
        name: t.tracker_name,
        entries: Array.isArray(t.entries) ? t.entries.length : 0,
      }));
    },
    enabled: !!user,
  });

  const weeklyStats = useMemo(() => {
    const focusSessions = activityData.filter((a: any) => a.action === "focus_session").length;
    const goalsCompleted = activityData.filter((a: any) => a.action === "daily_goal").length;
    const views = activityData.filter((a: any) => a.action === "view").length;

    // Activity by day of week
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const byDay = days.map(day => ({ day, count: 0 }));
    activityData.forEach((a: any) => {
      const d = new Date(a.created_at).getDay();
      byDay[d].count++;
    });

    return { focusSessions, goalsCompleted, views, byDay, totalActions: activityData.length };
  }, [activityData]);

  const recentNotes = notes.slice(0, 5);
  const activeProjects = projects.filter(p => p.status !== "Completed");
  const breakthroughs = notes.filter(n => n.type === "breakthrough").length;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Progress Report</h1>
              <p className="text-sm text-muted-foreground">Your weekly research and learning summary.</p>
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Total Actions", value: weeklyStats.totalActions, icon: TrendingUp },
              { label: "Focus Sessions", value: weeklyStats.focusSessions, icon: Clock },
              { label: "Goals Set", value: weeklyStats.goalsCompleted, icon: CheckCircle2 },
              { label: "Notes Written", value: notes.length, icon: BookOpen },
              { label: "Breakthroughs", value: breakthroughs, icon: Flame },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl border border-border bg-card/50 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Activity Chart */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyStats.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Active Projects */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
                Active Projects ({activeProjects.length})
              </h3>
              {activeProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No active projects.</p>
              ) : (
                <div className="space-y-3">
                  {activeProjects.slice(0, 5).map(p => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground truncate">{p.name}</span>
                        <span className="text-primary font-bold">{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tracker Summary */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Trackers</h3>
              {trackerData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No trackers yet.</p>
              ) : (
                <div className="space-y-2">
                  {trackerData.map((t: any) => (
                    <div key={t.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20">
                      <span className="text-sm text-foreground">{t.name}</span>
                      <span className="text-xs font-bold text-primary">{t.entries} entries</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notes */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Recent Notes</h3>
              {recentNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentNotes.map(n => (
                    <div key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/20">
                      <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate">{n.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        n.type === "breakthrough" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>{n.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <Award className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-1">Weekly Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You've been active {weeklyStats.totalActions} times this week with {notes.length} notes,
              {" "}{projects.length} projects, and {bookmarks.length} bookmarks.
              {weeklyStats.focusSessions > 0 && ` You completed ${weeklyStats.focusSessions} focus sessions.`}
              {breakthroughs > 0 && ` 🎉 You recorded ${breakthroughs} breakthrough${breakthroughs > 1 ? "s" : ""}!`}
              {" "}Keep pushing your research forward!
            </p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ProgressReportsPage;

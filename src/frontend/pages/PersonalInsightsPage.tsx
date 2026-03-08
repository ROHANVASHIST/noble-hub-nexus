import { useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Flame, Target, Clock, TrendingUp, Calendar,
  Award, Zap, Brain, FileText, Bookmark, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval, getDay, subWeeks, startOfWeek, differenceInDays } from "date-fns";

const PersonalInsightsPage = () => {
  const { user } = useAuth();

  // ── Fetch all user data in parallel ──
  const { data: activities = [] } = useQuery({
    queryKey: ["insights-activities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1000);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["insights-notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("scholar_notes").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["insights-projects", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("research_projects").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["insights-bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("bookmarks").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["insights-reminders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("reminders").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  // ── Derived metrics ──
  const metrics = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    // Activity heatmap (last 90 days)
    const last90 = subDays(today, 89);
    const days90 = eachDayOfInterval({ start: last90, end: today });
    const activityByDay = new Map<string, number>();
    activities.forEach((a: any) => {
      const key = format(new Date(a.created_at), "yyyy-MM-dd");
      activityByDay.set(key, (activityByDay.get(key) || 0) + 1);
    });
    const heatmap = days90.map(d => ({
      date: format(d, "yyyy-MM-dd"),
      label: format(d, "MMM d"),
      count: activityByDay.get(format(d, "yyyy-MM-dd")) || 0,
      dayOfWeek: getDay(d),
      weekIndex: Math.floor(differenceInDays(d, last90) / 7),
    }));

    // Current streak
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const key = format(subDays(today, i), "yyyy-MM-dd");
      if (activityByDay.has(key)) streak++;
      else break;
    }

    // Focus sessions
    const focusSessions = activities.filter((a: any) => a.action === "focus_session");
    const totalFocusMin = focusSessions.reduce((s: number, a: any) => s + ((a.metadata as any)?.minutes || 0), 0);

    // Weekly activity (last 8 weeks)
    const weeklyData = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = startOfWeek(subWeeks(now, w));
      const weekEnd = subWeeks(now, w - 1);
      const label = format(weekStart, "MMM d");
      const weekActivities = activities.filter((a: any) => {
        const d = new Date(a.created_at);
        return d >= weekStart && d < weekEnd;
      });
      const focus = weekActivities.filter((a: any) => a.action === "focus_session").length;
      const goals = weekActivities.filter((a: any) => a.action === "daily_goal").length;
      const other = weekActivities.length - focus - goals;
      weeklyData.push({ week: label, focus, goals, other, total: weekActivities.length });
    }

    // Skill radar
    const skillRadar = [
      { skill: "Notes", value: Math.min(100, notes.length * 10) },
      { skill: "Research", value: Math.min(100, projects.length * 20) },
      { skill: "Focus", value: Math.min(100, focusSessions.length * 5) },
      { skill: "Bookmarks", value: Math.min(100, bookmarks.length * 8) },
      { skill: "Goals", value: Math.min(100, activities.filter((a: any) => a.action === "daily_goal").length * 5) },
      { skill: "Engagement", value: Math.min(100, activities.length * 2) },
    ];

    // Daily activity trend (last 14 days)
    const last14 = subDays(today, 13);
    const dailyTrend = eachDayOfInterval({ start: last14, end: today }).map(d => ({
      day: format(d, "EEE"),
      date: format(d, "MMM d"),
      count: activityByDay.get(format(d, "yyyy-MM-dd")) || 0,
    }));

    // Milestones
    const milestones = [];
    if (notes.length >= 1) milestones.push({ label: "First Note", icon: "📝", done: true });
    if (notes.length >= 10) milestones.push({ label: "10 Notes", icon: "📚", done: true });
    if (notes.length >= 50) milestones.push({ label: "50 Notes", icon: "🏆", done: true });
    if (focusSessions.length >= 1) milestones.push({ label: "First Focus", icon: "⏱️", done: true });
    if (focusSessions.length >= 10) milestones.push({ label: "10 Sessions", icon: "🔥", done: true });
    if (projects.length >= 1) milestones.push({ label: "First Project", icon: "🔬", done: true });
    if (bookmarks.length >= 5) milestones.push({ label: "5 Bookmarks", icon: "⭐", done: true });
    if (streak >= 7) milestones.push({ label: "7-day Streak", icon: "🔥", done: true });
    if (streak >= 30) milestones.push({ label: "30-day Streak", icon: "💎", done: true });
    // Upcoming milestones
    const upcomingTargets = [
      { label: `${10 - notes.length} more notes`, target: 10, current: notes.length, icon: "📝" },
      { label: `${10 - focusSessions.length} more sessions`, target: 10, current: focusSessions.length, icon: "⏱️" },
      { label: `${7 - streak} more days streak`, target: 7, current: streak, icon: "🔥" },
    ].filter(m => m.current < m.target);

    const completedReminders = reminders.filter((r: any) => r.is_completed).length;
    const pendingReminders = reminders.length - completedReminders;

    return {
      heatmap, streak, totalFocusMin, focusSessions: focusSessions.length,
      weeklyData, skillRadar, dailyTrend, milestones, upcomingTargets,
      totalActivities: activities.length, completedReminders, pendingReminders,
      maxHeatmap: Math.max(1, ...heatmap.map(h => h.count)),
    };
  }, [activities, notes, projects, bookmarks, reminders]);

  const heatColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    const ratio = count / metrics.maxHeatmap;
    if (ratio < 0.25) return "bg-primary/20";
    if (ratio < 0.5) return "bg-primary/40";
    if (ratio < 0.75) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-primary" />
            Personal Insights
          </h1>
          <p className="mt-2 text-muted-foreground">Your learning journey, visualized.</p>
        </motion.div>

        {/* ── KPI row ── */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { icon: Flame, label: "Streak", value: `${metrics.streak}d`, color: "text-orange-400" },
            { icon: Zap, label: "Activities", value: metrics.totalActivities, color: "text-primary" },
            { icon: Clock, label: "Focus Time", value: `${metrics.totalFocusMin}m`, color: "text-blue-400" },
            { icon: Brain, label: "Focus Sessions", value: metrics.focusSessions, color: "text-purple-400" },
            { icon: FileText, label: "Notes", value: notes.length, color: "text-green-400" },
            { icon: Bookmark, label: "Bookmarks", value: bookmarks.length, color: "text-amber-400" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 text-center hover:border-primary/30 transition-colors">
                <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="heatmap" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          {/* ── Heatmap ── */}
          <TabsContent value="heatmap">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Activity Heatmap
                    <Badge variant="secondary" className="text-xs ml-2">Last 90 days</Badge>
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    Less
                    {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${heatColor(v * metrics.maxHeatmap)}`} />
                    ))}
                    More
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-[640px]">
                    {metrics.heatmap.map((d, i) => (
                      <div
                        key={d.date}
                        className={`w-3 h-3 rounded-sm ${heatColor(d.count)} transition-colors`}
                        title={`${d.label}: ${d.count} activities`}
                      />
                    ))}
                  </div>
                </div>
              </Card>

              {/* Daily trend chart */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Daily Activity (14 days)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={metrics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <RTooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""}
                    />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Progress ── */}
          <TabsContent value="progress">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-6">
              {/* Weekly breakdown */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-primary" /> Weekly Breakdown
                  <Badge variant="secondary" className="text-xs ml-2">Last 8 weeks</Badge>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <RTooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="focus" stackId="a" fill="hsl(var(--primary))" name="Focus" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="goals" stackId="a" fill="hsl(var(--primary) / 0.5)" name="Goals" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="other" stackId="a" fill="hsl(var(--muted))" name="Other" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Research projects progress */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Research Projects
                </h3>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No research projects yet. Start one from the Planner!</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((p: any) => (
                      <div key={p.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-foreground">{p.name}</span>
                          <span className="text-muted-foreground">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Reminders summary */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Reminders & Goals
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-green-400">{metrics.completedReminders}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-amber-400">{metrics.pendingReminders}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Skills Radar ── */}
          <TabsContent value="skills">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Scholar Skill Radar
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={metrics.skillRadar}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Radar name="Skills" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {metrics.skillRadar.map(s => (
                    <div key={s.skill} className="text-center p-2 rounded-lg bg-muted/20">
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.skill}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Milestones ── */}
          <TabsContent value="milestones">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-6">
              {/* Earned */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Milestones Earned
                </h3>
                {metrics.milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Start using the app to earn milestones!</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {metrics.milestones.map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20"
                      >
                        <span className="text-xl">{m.icon}</span>
                        <span className="text-sm font-medium text-foreground">{m.label}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Upcoming */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" /> Next Milestones
                </h3>
                {metrics.upcomingTargets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All nearby milestones achieved! 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.upcomingTargets.map(m => (
                      <div key={m.label} className="flex items-center gap-3">
                        <span className="text-lg">{m.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{m.label}</p>
                          <Progress value={(m.current / m.target) * 100} className="h-1.5 mt-1" />
                        </div>
                        <span className="text-xs text-muted-foreground">{m.current}/{m.target}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PersonalInsightsPage;

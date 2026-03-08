import { useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Timer, Flame, TrendingUp, Clock, Target, Award } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--secondary))"];

const PomodoroStatsPage = () => {
  const { user } = useAuth();

  const { data: sessions = [] } = useQuery({
    queryKey: ["focus-all-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .eq("action", "focus_session")
        .order("created_at", { ascending: true })
        .limit(500);
      return data || [];
    },
    enabled: !!user,
  });

  const stats = useMemo(() => {
    const total = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => {
      const meta = s.metadata as Record<string, Json> | null;
      return sum + (Number(meta?.minutes) || 25);
    }, 0);

    // Daily chart (last 14 days)
    const dayMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().split("T")[0], 0);
    }
    sessions.forEach(s => {
      const day = s.created_at.split("T")[0];
      if (dayMap.has(day)) {
        const meta = s.metadata as Record<string, Json> | null;
        dayMap.set(day, (dayMap.get(day) || 0) + (Number(meta?.minutes) || 25));
      }
    });
    const dailyChart = [...dayMap.entries()].map(([date, mins]) => ({
      date: new Date(date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }),
      minutes: mins,
    }));

    // Streak
    let streak = 0;
    const daysWithSessions = new Set(sessions.map(s => s.created_at.split("T")[0]));
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (daysWithSessions.has(d.toISOString().split("T")[0])) streak++;
      else if (i > 0) break;
    }

    // Weekly comparison
    const thisWeek = sessions.filter(s => {
      const d = new Date(s.created_at);
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;
    const lastWeek = sessions.filter(s => {
      const d = new Date(s.created_at);
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    }).length;

    // Hour distribution
    const hourBuckets: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    sessions.forEach(s => {
      const h = new Date(s.created_at).getHours();
      if (h >= 5 && h < 12) hourBuckets.Morning++;
      else if (h >= 12 && h < 17) hourBuckets.Afternoon++;
      else if (h >= 17 && h < 21) hourBuckets.Evening++;
      else hourBuckets.Night++;
    });
    const hourChart = Object.entries(hourBuckets).map(([name, value]) => ({ name, value }));

    return { total, totalMinutes, dailyChart, streak, thisWeek, lastWeek, hourChart };
  }, [sessions]);

  const kpis = [
    { label: "Total Sessions", value: stats.total, icon: Timer, color: "text-primary" },
    { label: "Total Focus Time", value: `${Math.round(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`, icon: Clock, color: "text-chart-2" },
    { label: "Current Streak", value: `${stats.streak} day${stats.streak !== 1 ? "s" : ""}`, icon: Flame, color: "text-chart-4" },
    { label: "This Week", value: stats.thisWeek, icon: Target, color: "text-chart-1" },
    { label: "vs Last Week", value: `${stats.thisWeek >= stats.lastWeek ? "+" : ""}${stats.thisWeek - stats.lastWeek}`, icon: TrendingUp, color: stats.thisWeek >= stats.lastWeek ? "text-green-500" : "text-red-500" },
    { label: "Avg/Day", value: `${sessions.length > 0 ? Math.round(stats.totalMinutes / 14) : 0}m`, icon: Award, color: "text-chart-3" },
  ];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Timer className="h-8 w-8 text-primary" /> Focus Statistics
          </h1>
          <p className="text-muted-foreground mt-1">Track your deep work trends and productivity patterns.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <k.icon className={`h-5 w-5 mx-auto mb-1 ${k.color}`} />
                  <div className="text-2xl font-bold text-foreground">{k.value}</div>
                  <div className="text-xs text-muted-foreground">{k.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Daily Focus Time (Last 14 Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Peak Hours</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.hourChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.hourChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Cumulative Focus Minutes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailyChart.reduce((acc: any[], d, i) => {
                const prev = i > 0 ? acc[i - 1].cumulative : 0;
                acc.push({ ...d, cumulative: prev + d.minutes });
                return acc;
              }, [])}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PomodoroStatsPage;

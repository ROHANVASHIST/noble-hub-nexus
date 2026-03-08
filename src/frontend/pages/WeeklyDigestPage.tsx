import { useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Mail, TrendingUp, BookOpen, Brain, Flame, Target, Clock, Award, Timer } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const WeeklyDigestPage = () => {
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ["digest-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString())
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["digest-notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await (supabase as any)
        .from("scholar_notes")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString());
      return data || [];
    },
    enabled: !!user,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["digest-bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString());
      return data || [];
    },
    enabled: !!user,
  });

  const digest = useMemo(() => {
    const focusSessions = activities.filter(a => a.action === "focus_session");
    const totalFocusMin = focusSessions.reduce((sum, s) => {
      const meta = s.metadata as Record<string, Json> | null;
      return sum + (Number(meta?.minutes) || 25);
    }, 0);
    const goalsCompleted = activities.filter(a => a.action === "daily_goal" && (a.metadata as any)?.completed).length;
    const breakthroughs = notes.filter((n: any) => n.type === "breakthrough").length;

    // Daily breakdown
    const dayMap = new Map<string, { focus: number; notes: number; bookmarks: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap.set(key, { focus: 0, notes: 0, bookmarks: 0 });
    }
    focusSessions.forEach(s => {
      const day = s.created_at.split("T")[0];
      const entry = dayMap.get(day);
      if (entry) {
        const meta = s.metadata as Record<string, Json> | null;
        entry.focus += Number(meta?.minutes) || 25;
      }
    });
    notes.forEach((n: any) => {
      const day = n.created_at.split("T")[0];
      const entry = dayMap.get(day);
      if (entry) entry.notes++;
    });
    bookmarks.forEach((b: any) => {
      const day = b.created_at.split("T")[0];
      const entry = dayMap.get(day);
      if (entry) entry.bookmarks++;
    });

    const chart = [...dayMap.entries()].map(([date, v]) => ({
      day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      ...v,
    }));

    // Score (0-100)
    const score = Math.min(100, Math.round(
      (focusSessions.length * 5) + (notes.length * 10) + (bookmarks.length * 3) + (goalsCompleted * 8) + (breakthroughs * 15)
    ));

    return { focusSessions: focusSessions.length, totalFocusMin, goalsCompleted, notesCount: notes.length, bookmarksCount: bookmarks.length, breakthroughs, chart, score };
  }, [activities, notes, bookmarks]);

  const scoreColor = digest.score >= 70 ? "text-green-500" : digest.score >= 40 ? "text-yellow-500" : "text-red-500";

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" /> Weekly Digest
          </h1>
          <p className="text-muted-foreground mt-1">Your research productivity summary for the past 7 days.</p>
        </motion.div>

        {/* Productivity Score */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="text-center py-6">
            <CardContent>
              <div className={`text-6xl font-bold ${scoreColor}`}>{digest.score}</div>
              <p className="text-muted-foreground mt-1">Productivity Score</p>
              <Badge variant="outline" className="mt-2">
                {digest.score >= 70 ? "🔥 Outstanding Week" : digest.score >= 40 ? "📈 Good Progress" : "🌱 Room to Grow"}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Focus Sessions", value: digest.focusSessions, icon: Clock, color: "text-primary" },
            { label: "Focus Time", value: `${Math.round(digest.totalFocusMin / 60)}h ${digest.totalFocusMin % 60}m`, icon: Timer as any, color: "text-chart-2" },
            { label: "Goals Done", value: digest.goalsCompleted, icon: Target, color: "text-chart-1" },
            { label: "Notes", value: digest.notesCount, icon: BookOpen, color: "text-chart-3" },
            { label: "Bookmarks", value: digest.bookmarksCount, icon: Brain, color: "text-chart-4" },
            { label: "Breakthroughs", value: digest.breakthroughs, icon: Award, color: "text-chart-5" },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
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

        {/* Daily Breakdown Chart */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Daily Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={digest.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="focus" name="Focus (min)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="notes" name="Notes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookmarks" name="Bookmarks" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" /> This Week's Insight</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            {digest.focusSessions === 0
              ? "You haven't logged any focus sessions this week. Try starting with just 25 minutes of deep work today!"
              : digest.score >= 70
              ? "Incredible week! You've maintained strong momentum. Keep your streak alive by setting fresh goals."
              : digest.notesCount === 0
              ? "Try taking at least one note per study session. Writing reinforces learning and builds your knowledge base."
              : "You're building good habits. Try increasing your daily focus time by 10 minutes this week."}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default WeeklyDigestPage;

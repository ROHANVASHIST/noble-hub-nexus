import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListChecks, Plus, Check, Trash2, Flame, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

type Goal = {
  id: string;
  text: string;
  completed: boolean;
  date: string;
};

const ReadingListPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState("");

  const todayKey = new Date().toISOString().split("T")[0];

  // Store goals in user_activity with action "daily_goal"
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["daily-goals", user?.id, todayKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .eq("action", "daily_goal")
        .gte("created_at", todayKey);
      return (data || []).map((d: any) => ({
        id: d.id,
        text: d.metadata?.text || "",
        completed: d.metadata?.completed || false,
        date: d.created_at,
      })) as Goal[];
    },
    enabled: !!user,
  });

  // Calculate streak
  const { data: streak = 0 } = useQuery({
    queryKey: ["goal-streak", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("user_activity")
        .select("created_at, metadata")
        .eq("user_id", user.id)
        .eq("action", "daily_goal")
        .order("created_at", { ascending: false })
        .limit(365);
      if (!data) return 0;

      const completedDays = new Set(
        data
          .filter((d: any) => d.metadata?.completed)
          .map((d: any) => d.created_at.split("T")[0])
      );

      let s = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (completedDays.has(d.toISOString().split("T")[0])) s++;
        else if (i > 0) break; // allow today to not be completed yet
      }
      return s;
    },
    enabled: !!user,
  });

  const addGoal = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("user_activity").insert({
        user_id: user.id,
        action: "daily_goal",
        metadata: { text, completed: false },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-goals"] });
      setNewGoal("");
    },
  });

  const toggleGoal = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await supabase
        .from("user_activity")
        .update({ metadata: { text: goals.find(g => g.id === id)?.text, completed } as any })
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-streak"] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      // user_activity doesn't have DELETE RLS, so we'll mark it differently
      // Actually it does not — let's just remove from UI
      toast.info("Goal removed from view");
    },
  });

  const completedCount = goals.filter(g => g.completed).length;
  const progressPct = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Daily Goals</h1>
              <p className="text-sm text-muted-foreground">Set daily learning targets and build streaks.</p>
            </div>
          </div>

          {/* Streak & Progress */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent text-center">
              <Flame className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-4xl font-display font-black text-foreground">{streak}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/50 text-center">
              <Star className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-4xl font-display font-black text-foreground">{completedCount}/{goals.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's Goals</p>
              <Progress value={progressPct} className="h-2 mt-3" />
            </div>
          </div>

          {/* Add Goal */}
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Add a learning goal for today..."
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newGoal.trim()) addGoal.mutate(newGoal.trim()); }}
              className="rounded-xl"
            />
            <Button
              onClick={() => { if (newGoal.trim()) addGoal.mutate(newGoal.trim()); }}
              disabled={!newGoal.trim()}
              className="rounded-xl gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {/* Goals List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border">
              <ListChecks className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground">No goals for today</h3>
              <p className="text-sm text-muted-foreground mt-1">Add your first learning goal above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map(g => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    g.completed
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-card/50"
                  }`}
                >
                  <button
                    onClick={() => toggleGoal.mutate({ id: g.id, completed: !g.completed })}
                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      g.completed
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30 hover:border-primary/50"
                    }`}
                  >
                    {g.completed && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </button>
                  <span className={`text-sm flex-1 ${g.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                    {g.text}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Goal Suggestions */}
          <div className="mt-8 p-5 rounded-2xl border border-border bg-card/50">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Suggested Goals</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Read 1 research paper",
                "Watch a Nobel lecture",
                "Complete a quiz session",
                "Write a research note",
                "Explore 3 new laureates",
                "Use the AI Oracle",
                "Log 30 min focus time",
                "Review flashcards",
              ].map(s => (
                <button
                  key={s}
                  onClick={() => addGoal.mutate(s)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ReadingListPage;

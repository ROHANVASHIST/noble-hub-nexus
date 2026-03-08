import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import {
  Plus, Trash2, TrendingUp, Target, Calendar, BarChart3,
  Loader2, Edit2, Check, X, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

type TrackerEntry = { value: number; date: string; note?: string };

type Tracker = {
  id: string;
  tracker_name: string;
  tracker_type: string;
  unit: string;
  entries: TrackerEntry[];
  created_at: string;
};

const PRESET_TRACKERS = [
  { name: "Research Papers Read", unit: "papers", type: "quantity" },
  { name: "Study Hours", unit: "hours", type: "quantity" },
  { name: "Nobel Lectures Watched", unit: "lectures", type: "quantity" },
  { name: "Quiz Score Average", unit: "%", type: "quantity" },
  { name: "Mentor Sessions", unit: "sessions", type: "quantity" },
  { name: "Notes Written", unit: "notes", type: "quantity" },
];

const TrackerPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [entryValue, setEntryValue] = useState("");
  const [entryNote, setEntryNote] = useState("");

  const { data: trackers = [], isLoading } = useQuery({
    queryKey: ["trackers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_trackers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        entries: Array.isArray(t.entries) ? t.entries : [],
      })) as Tracker[];
    },
    enabled: !!user,
  });

  const createTracker = useMutation({
    mutationFn: async ({ name, unit }: { name: string; unit: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("user_trackers").insert({
        user_id: user.id,
        tracker_name: name,
        unit,
        tracker_type: "quantity",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      setNewName("");
      setNewUnit("");
      setShowCreate(false);
      toast.success("Tracker created!");
    },
  });

  const addEntry = useMutation({
    mutationFn: async ({ trackerId, value, note }: { trackerId: string; value: number; note: string }) => {
      const tracker = trackers.find(t => t.id === trackerId);
      if (!tracker) throw new Error("Tracker not found");
      const newEntry: TrackerEntry = {
        value,
        date: new Date().toISOString(),
        note: note || undefined,
      };
      const updatedEntries = [...tracker.entries, newEntry];
      const { error } = await supabase
        .from("user_trackers")
        .update({ entries: updatedEntries as any, updated_at: new Date().toISOString() })
        .eq("id", trackerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      setAddingTo(null);
      setEntryValue("");
      setEntryNote("");
      toast.success("Entry logged!");
    },
  });

  const deleteTracker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_trackers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Tracker deleted");
    },
  });

  const getStats = (entries: TrackerEntry[]) => {
    if (entries.length === 0) return { total: 0, avg: 0, max: 0, streak: 0, last7: 0 };
    const total = entries.reduce((sum, e) => sum + e.value, 0);
    const avg = total / entries.length;
    const max = Math.max(...entries.map(e => e.value));

    // Last 7 days
    const week = new Date();
    week.setDate(week.getDate() - 7);
    const last7 = entries.filter(e => new Date(e.date) >= week).reduce((s, e) => s + e.value, 0);

    // Streak (consecutive days)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      if (entries.some(e => e.date.split("T")[0] === dayStr)) {
        streak++;
      } else {
        break;
      }
    }

    return { total, avg: Math.round(avg * 10) / 10, max, streak, last7 };
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Personal Tracker</h1>
              </div>
              <p className="text-sm text-muted-foreground">Track your research progress, study hours, and learning milestones.</p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} className="rounded-xl gap-2">
              <Plus className="h-4 w-4" /> New Tracker
            </Button>
          </div>

          {/* Create New Tracker */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="p-6 rounded-2xl border border-border bg-card/50 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Create Tracker</h3>

                  {/* Presets */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TRACKERS.map(p => (
                        <button
                          key={p.name}
                          onClick={() => createTracker.mutate({ name: p.name, unit: p.unit })}
                          className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom */}
                  <div className="flex gap-3">
                    <Input
                      placeholder="Tracker name..."
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Unit (e.g. hours)"
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="rounded-xl w-40"
                    />
                    <Button
                      onClick={() => { if (newName.trim()) createTracker.mutate({ name: newName, unit: newUnit }); }}
                      disabled={!newName.trim()}
                      className="rounded-xl"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trackers Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trackers.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-muted/20 border border-dashed border-border">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">No trackers yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Start tracking your research progress and learning goals.</p>
              <Button onClick={() => setShowCreate(true)} className="rounded-xl gap-2">
                <Plus className="h-4 w-4" /> Create your first tracker
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {trackers.map(tracker => {
                const stats = getStats(tracker.entries);
                const isAdding = addingTo === tracker.id;
                const todayEntries = tracker.entries.filter(e => e.date.split("T")[0] === new Date().toISOString().split("T")[0]);
                const todayTotal = todayEntries.reduce((s, e) => s + e.value, 0);

                return (
                  <motion.div
                    key={tracker.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-border bg-card/50 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{tracker.tracker_name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {tracker.entries.length} entries · {tracker.unit}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setAddingTo(isAdding ? null : tracker.id)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteTracker.mutate(tracker.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Total", value: stats.total },
                        { label: "Average", value: stats.avg },
                        { label: "This Week", value: stats.last7 },
                        { label: "Streak", value: `${stats.streak}d` },
                      ].map(s => (
                        <div key={s.label} className="text-center p-2 rounded-xl bg-muted/30">
                          <p className="text-lg font-bold text-foreground">{s.value}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Today progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        <span>Today</span>
                        <span>{todayTotal} {tracker.unit}</span>
                      </div>
                      <Progress value={Math.min((todayTotal / Math.max(stats.avg || 1, 1)) * 100, 100)} className="h-2" />
                    </div>

                    {/* Add Entry */}
                    <AnimatePresence>
                      {isAdding && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 pt-2">
                            <Input
                              type="number"
                              placeholder="Value"
                              value={entryValue}
                              onChange={e => setEntryValue(e.target.value)}
                              className="rounded-xl w-24"
                            />
                            <Input
                              placeholder="Note (optional)"
                              value={entryNote}
                              onChange={e => setEntryNote(e.target.value)}
                              className="rounded-xl flex-1"
                            />
                            <Button
                              size="icon"
                              className="rounded-xl h-10 w-10 shrink-0"
                              onClick={() => {
                                const val = parseFloat(entryValue);
                                if (isNaN(val)) { toast.error("Enter a valid number"); return; }
                                addEntry.mutate({ trackerId: tracker.id, value: val, note: entryNote });
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl h-10 w-10 shrink-0"
                              onClick={() => setAddingTo(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Recent entries */}
                    {tracker.entries.length > 0 && (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {tracker.entries.slice(-5).reverse().map((e, i) => (
                          <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-muted/20">
                            <span className="text-muted-foreground">{format(new Date(e.date), "MMM d, HH:mm")}</span>
                            <div className="flex items-center gap-2">
                              {e.note && <span className="text-muted-foreground/60 truncate max-w-[120px]">{e.note}</span>}
                              <Badge variant="secondary" className="rounded-full text-[10px]">
                                {e.value} {tracker.unit}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default TrackerPage;

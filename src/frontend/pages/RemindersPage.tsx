import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmClock, Plus, Check, Trash2, Calendar, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  high: { label: "High", color: "text-red-500", icon: AlertTriangle },
  medium: { label: "Medium", color: "text-yellow-500", icon: Clock },
  low: { label: "Low", color: "text-green-500", icon: Calendar },
};

const RemindersPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user || !title.trim() || !dueDate) throw new Error("Missing fields");
      const { error } = await (supabase as any).from("reminders").insert({
        user_id: user.id, title: title.trim(), description: description.trim(),
        due_date: new Date(dueDate).toISOString(), priority,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      setTitle(""); setDescription(""); setDueDate(""); setShowAdd(false);
      toast.success("Reminder set!");
    },
    onError: () => toast.error("Failed to create reminder"),
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await (supabase as any).from("reminders").update({ is_completed: !completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast.success("Updated!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast.success("Deleted"); },
  });

  const filtered = reminders.filter((r: any) => {
    if (filter === "pending") return !r.is_completed;
    if (filter === "completed") return r.is_completed;
    return true;
  });

  const overdue = reminders.filter((r: any) => !r.is_completed && new Date(r.due_date) < new Date()).length;
  const pending = reminders.filter((r: any) => !r.is_completed).length;
  const completed = reminders.filter((r: any) => r.is_completed).length;

  const isOverdue = (date: string, done: boolean) => !done && new Date(date) < new Date();
  const isDueSoon = (date: string, done: boolean) => {
    if (done) return false;
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60);
    return diff > 0 && diff < 24;
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <AlarmClock className="h-8 w-8 text-primary" /> Reminders & Deadlines
          </h1>
          <p className="text-muted-foreground mt-1">Stay on track with study deadlines, paper reviews, and research milestones.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", value: pending, color: "text-yellow-500" },
            { label: "Overdue", value: overdue, color: "text-red-500" },
            { label: "Completed", value: completed, color: "text-green-500" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 items-center">
          <div className="flex gap-1">
            {(["all", "pending", "completed"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
            ))}
          </div>
          <div className="flex-1" />
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" /> New Reminder</Button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <Input placeholder="Reminder title" value={title} onChange={e => setTitle(e.target.value)} />
                  <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                  <div className="flex gap-3">
                    <Input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1" />
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button onClick={() => addMutation.mutate()} disabled={!title.trim() || !dueDate || addMutation.isPending}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><AlarmClock className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No reminders yet.</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((r: any, i: number) => {
              const cfg = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.medium;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className={`group ${r.is_completed ? "opacity-60" : ""} ${isOverdue(r.due_date, r.is_completed) ? "border-red-500/40" : isDueSoon(r.due_date, r.is_completed) ? "border-yellow-500/40" : ""}`}>
                    <CardContent className="py-3 flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                        onClick={() => toggleComplete.mutate({ id: r.id, completed: r.is_completed })}>
                        <Check className={`h-4 w-4 ${r.is_completed ? "text-green-500" : "text-muted-foreground"}`} />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-foreground ${r.is_completed ? "line-through" : ""}`}>{r.title}</p>
                        {r.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                          <span className={`text-xs ${isOverdue(r.due_date, r.is_completed) ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                            {isOverdue(r.due_date, r.is_completed) ? "⚠ Overdue · " : isDueSoon(r.due_date, r.is_completed) ? "⏰ Due soon · " : ""}
                            {new Date(r.due_date).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default RemindersPage;

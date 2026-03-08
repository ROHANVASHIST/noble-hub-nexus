import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, X, Pin, Trash2, ChevronUp, ChevronDown, Palette } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

const QuickCapture = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newColor, setNewColor] = useState("#fbbf24");

  const { data: notes = [] } = useQuery({
    queryKey: ["scratchpad", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("scratchpad")
        .select("*")
        .eq("user_id", user.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user || !newContent.trim()) return;
      const { error } = await (supabase as any).from("scratchpad").insert({
        user_id: user.id, content: newContent.trim(), color: newColor,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scratchpad"] }); setNewContent(""); toast.success("Captured!"); },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("scratchpad").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scratchpad"] }),
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await (supabase as any).from("scratchpad").update({ pinned: !pinned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scratchpad"] }),
  });

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      >
        {open ? <X className="h-5 w-5" /> : <StickyNote className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-80 max-h-[70vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-primary" /> Quick Capture
              </h3>
            </div>

            <div className="p-3 border-b border-border space-y-2">
              <Textarea
                placeholder="Capture an idea, snippet, or note..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={2}
                className="text-sm resize-none"
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addMutation.mutate(); }}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newContent.trim() || addMutation.isPending} className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" /> Save
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[40vh] p-2 space-y-2">
              {notes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No captures yet</p>
              ) : notes.map((n: any) => (
                <motion.div key={n.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="group relative rounded-lg p-2.5 text-sm border border-border"
                  style={{ borderLeftColor: n.color, borderLeftWidth: 3 }}
                >
                  <p className="text-foreground whitespace-pre-wrap text-xs leading-relaxed pr-12">{n.content}</p>
                  <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => togglePin.mutate({ id: n.id, pinned: n.pinned })}
                      className={`p-1 rounded hover:bg-muted ${n.pinned ? "text-primary" : "text-muted-foreground"}`}>
                      <Pin className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(n.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {n.pinned && "📌 "}{new Date(n.created_at).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickCapture;

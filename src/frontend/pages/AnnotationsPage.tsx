import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Highlighter, Plus, Trash2, Search, StickyNote, Palette } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  { label: "Yellow", value: "#fbbf24" },
  { label: "Green", value: "#34d399" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Pink", value: "#f472b6" },
  { label: "Purple", value: "#a78bfa" },
];

const AnnotationsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newColor, setNewColor] = useState("#fbbf24");
  const [newItemType, setNewItemType] = useState("general");

  const { data: annotations = [], isLoading } = useQuery({
    queryKey: ["annotations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("annotations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user || !newText.trim()) throw new Error("Text required");
      const { error } = await (supabase as any).from("annotations").insert({
        user_id: user.id,
        item_id: crypto.randomUUID(),
        item_type: newItemType,
        selected_text: newText.trim(),
        note: newNote.trim(),
        color: newColor,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annotations"] });
      setNewText(""); setNewNote(""); setShowAdd(false);
      toast.success("Highlight saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("annotations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["annotations"] }); toast.success("Deleted"); },
    onError: () => toast.error("Failed to delete"),
  });

  const filtered = annotations.filter((a: any) =>
    a.selected_text.toLowerCase().includes(search.toLowerCase()) ||
    a.note?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Highlighter className="h-8 w-8 text-primary" /> Annotations & Highlights
          </h1>
          <p className="text-muted-foreground mt-1">Save and organize important text snippets with color-coded highlights.</p>
        </motion.div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search highlights..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Highlight
          </Button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <Textarea placeholder="Paste or type the highlighted text..." value={newText} onChange={e => setNewText(e.target.value)} rows={3} />
                  <Input placeholder="Add a note (optional)" value={newNote} onChange={e => setNewNote(e.target.value)} />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      {COLORS.map(c => (
                        <button key={c.value} onClick={() => setNewColor(c.value)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${newColor === c.value ? "border-foreground scale-125" : "border-transparent"}`}
                          style={{ backgroundColor: c.value }} title={c.label} />
                      ))}
                    </div>
                    <select value={newItemType} onChange={e => setNewItemType(e.target.value)}
                      className="text-sm bg-background border border-input rounded-md px-2 py-1 text-foreground">
                      <option value="general">General</option>
                      <option value="laureate">Laureate</option>
                      <option value="paper">Paper</option>
                      <option value="lecture">Lecture</option>
                    </select>
                    <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !newText.trim()} size="sm">Save</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><StickyNote className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No highlights yet. Start annotating!</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((a: any, i: number) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="group">
                  <CardContent className="py-4 flex gap-4">
                    <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium leading-relaxed">"{a.selected_text}"</p>
                      {a.note && <p className="text-sm text-muted-foreground mt-1 italic">{a.note}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{a.item_type}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AnnotationsPage;

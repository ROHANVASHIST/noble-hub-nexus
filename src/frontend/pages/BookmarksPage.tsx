import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark, Trash2, ExternalLink, Filter, BookOpen,
  Video, Award, Loader2, BookmarkX
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BookmarkItem = {
  id: string;
  item_id: string;
  item_type: string;
  created_at: string;
};

const TYPE_CONFIG: Record<string, { icon: typeof BookOpen; label: string; color: string; path: string }> = {
  paper: { icon: BookOpen, label: "Paper", color: "bg-emerald-500/10 text-emerald-500", path: "/research" },
  lecture: { icon: Video, label: "Lecture", color: "bg-blue-500/10 text-blue-500", path: "/lectures" },
  laureate: { icon: Award, label: "Laureate", color: "bg-primary/10 text-primary", path: "/laureates" },
};

const BookmarksPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["all-bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BookmarkItem[];
    },
    enabled: !!user,
  });

  // Fetch laureate details for bookmarked laureates
  const laureateIds = bookmarks.filter(b => b.item_type === "laureate").map(b => b.item_id);
  const { data: laureateDetails = [] } = useQuery({
    queryKey: ["bookmark-laureates", laureateIds],
    queryFn: async () => {
      if (laureateIds.length === 0) return [];
      const { data } = await supabase
        .from("laureates")
        .select("id, first_name, last_name, category, year")
        .in("id", laureateIds);
      return data || [];
    },
    enabled: laureateIds.length > 0,
  });

  const deleteBookmark = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-bookmarks"] });
      toast.success("Bookmark removed");
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-bookmarks"] });
      toast.success("All bookmarks cleared");
    },
  });

  const filtered = filter === "all" ? bookmarks : bookmarks.filter(b => b.item_type === filter);
  const counts = {
    all: bookmarks.length,
    laureate: bookmarks.filter(b => b.item_type === "laureate").length,
    paper: bookmarks.filter(b => b.item_type === "paper").length,
    lecture: bookmarks.filter(b => b.item_type === "lecture").length,
  };

  const getLaureateInfo = (itemId: string) => {
    const l = laureateDetails.find((d: any) => d.id === itemId);
    return l ? `${l.first_name} ${l.last_name} — ${l.category} (${l.year})` : itemId.slice(0, 8);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Bookmarks</h1>
                <p className="text-sm text-muted-foreground">Your saved laureates, papers, and lectures.</p>
              </div>
            </div>
            {bookmarks.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive gap-1" onClick={() => clearAll.mutate()}>
                <Trash2 className="h-3 w-3" /> Clear All
              </Button>
            )}
          </div>

          <Tabs value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList className="rounded-xl">
              {Object.entries(counts).map(([key, count]) => (
                <TabsTrigger key={key} value={key} className="rounded-lg text-xs gap-1 capitalize">
                  {key === "all" ? <Filter className="h-3 w-3" /> : null}
                  {key} <Badge variant="secondary" className="ml-1 h-4 text-[9px] rounded-full">{count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-muted/20 border border-dashed border-border">
              <BookmarkX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">No bookmarks yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Save laureates, papers, and lectures from the library.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.map(b => {
                  const config = TYPE_CONFIG[b.item_type] || TYPE_CONFIG.paper;
                  const Icon = config.icon;
                  const linkPath = b.item_type === "laureate" ? `/laureates/${b.item_id}` : config.path;

                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/20 transition-all"
                    >
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {b.item_type === "laureate" ? getLaureateInfo(b.item_id) : `${config.label} — ${b.item_id.slice(0, 8)}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Saved {formatDate(b.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                          <Link to={linkPath}><ExternalLink className="h-3 w-3" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBookmark.mutate(b.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default BookmarksPage;

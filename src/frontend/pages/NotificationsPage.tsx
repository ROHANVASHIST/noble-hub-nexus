import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import {
  Bell, Check, CheckCheck, Trash2, Info, Award, BookOpen,
  TrendingUp, Sparkles, Filter, RefreshCw, Loader2, BellOff
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLaureates } from "@/backend/services/laureates";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  info: Info,
  achievement: Award,
  research: BookOpen,
  trend: TrendingUp,
  ai: Sparkles,
};

const TYPE_COLORS: Record<string, string> = {
  info: "text-blue-500",
  achievement: "text-amber-500",
  research: "text-emerald-500",
  trend: "text-violet-500",
  ai: "text-primary",
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user,
  });

  // Generate daily notifications on first load
  useEffect(() => {
    if (!user) return;
    const todayKey = `notif-generated-${new Date().toISOString().split("T")[0]}`;
    if (localStorage.getItem(todayKey)) return;

    const generateDailyNotifications = async () => {
      const laureates = await fetchLaureates();
      if (!laureates || laureates.length === 0) return;

      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const featured = laureates[dayOfYear % laureates.length];

      const dailyNotifs = [
        {
          user_id: user.id,
          title: "🏅 Nobel of the Day",
          message: `Today's featured laureate: ${featured.first_name} ${featured.last_name} (${featured.category}, ${featured.year}) — "${featured.motivation}"`,
          type: "info",
          link: `/laureates/${featured.id}`,
        },
        {
          user_id: user.id,
          title: "📊 Daily Research Digest",
          message: `Explore ${laureates.filter(l => l.category === featured.category).length} laureates in ${featured.category}. New insights and connections await in the Discovery engine.`,
          type: "research",
          link: "/discovery",
        },
        {
          user_id: user.id,
          title: "🧠 AI Mentor Tip",
          message: "Your AI mentors are ready for deep research conversations. Try asking about methodology, career advice, or cross-disciplinary connections.",
          type: "ai",
          link: "/mentorship",
        },
      ];

      const { error } = await supabase.from("notifications").insert(dailyNotifs);
      if (!error) {
        localStorage.setItem(todayKey, "true");
        refetch();
      }
    };

    generateDailyNotifications();
  }, [user, refetch]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotif = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("notifications").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications cleared");
    },
  });

  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge className="rounded-full">{unreadCount} new</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Daily Nobel updates, research digests, and activity alerts.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1 text-xs">
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} className="gap-1 text-xs">
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()} className="gap-1 text-xs text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" /> Clear all
                </Button>
              )}
            </div>
          </div>

          <Tabs value={filter} onValueChange={v => setFilter(v as any)} className="mb-6">
            <TabsList className="rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs gap-1">
                <Bell className="h-3 w-3" /> All <Badge variant="secondary" className="ml-1 h-4 text-[9px] rounded-full">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-lg text-xs gap-1">
                <Filter className="h-3 w-3" /> Unread <Badge variant="secondary" className="ml-1 h-4 text-[9px] rounded-full">{unreadCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-muted/20 border border-dashed border-border">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">
                {filter === "unread" ? "All caught up!" : "No notifications yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "unread" ? "You've read all your notifications." : "Notifications will appear here as you explore."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Bell;
                  const color = TYPE_COLORS[n.type] || "text-muted-foreground";
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        n.is_read
                          ? "bg-card/30 border-border"
                          : "bg-card border-primary/20 shadow-sm"
                      }`}
                      onClick={() => {
                        if (!n.is_read) markRead.mutate(n.id);
                        if (n.link) window.location.href = n.link;
                      }}
                    >
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? "bg-muted" : "bg-primary/10"}`}>
                        <Icon className={`h-4 w-4 ${n.is_read ? "text-muted-foreground" : color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-semibold truncate ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                            {n.title}
                          </h4>
                          {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/60 mt-1 block">{formatTime(n.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.is_read && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id); }}>
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id); }}>
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

export default NotificationsPage;

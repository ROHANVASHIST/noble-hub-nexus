import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing, Plus, Trash2, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Seo from "@/frontend/components/Seo";

type Alert = {
  id: string;
  topic: string;
  sources: string[];
  is_active: boolean;
  last_checked_at: string | null;
  seen_ids: string[];
};

type Paper = {
  id: string;
  source: string;
  title: string;
  authors: string[];
  year: number | null;
  url: string;
};

const ResearchAlertsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [topic, setTopic] = useState("");
  const [checking, setChecking] = useState<string | null>(null);
  const [newPapers, setNewPapers] = useState<Record<string, Paper[]>>({});

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["research-alerts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Alert[];
    },
    enabled: !!user,
  });

  const addAlert = useMutation({
    mutationFn: async (t: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("research_alerts").insert({ user_id: user.id, topic: t });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["research-alerts"] });
      setTopic("");
      toast.success("Alert created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("research_alerts").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["research-alerts"] }),
  });

  const removeAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("research_alerts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["research-alerts"] });
      toast.success("Alert removed");
    },
  });

  const checkAlert = async (a: Alert) => {
    setChecking(a.id);
    try {
      const { data, error } = await supabase.functions.invoke("research-search", {
        body: { query: a.topic, sources: a.sources, limit: 10 },
      });
      if (error) throw error;
      const results: Paper[] = (data?.results || []) as Paper[];
      const seen = new Set(a.seen_ids || []);
      const fresh = results.filter((p) => !seen.has(p.id));
      setNewPapers((prev) => ({ ...prev, [a.id]: fresh }));
      await supabase
        .from("research_alerts")
        .update({
          last_checked_at: new Date().toISOString(),
          seen_ids: Array.from(new Set([...(a.seen_ids || []), ...results.map((p) => p.id)])).slice(-500),
        })
        .eq("id", a.id);
      qc.invalidateQueries({ queryKey: ["research-alerts"] });
      toast.success(fresh.length ? `${fresh.length} new paper(s) for "${a.topic}"` : "No new papers yet");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check failed");
    } finally {
      setChecking(null);
    }
  };

  return (
    <PageLayout>
      <Seo
        title="Research Alerts | Nobel Hub"
        description="Track research topics across academic APIs and see newly published papers."
      />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BellRing className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Research Alerts</h1>
              <p className="text-sm text-muted-foreground">
                Follow topics and pull the newest papers across all academic sources.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <Input
              className="rounded-xl"
              placeholder="Topic to follow, e.g. quantum error correction"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && topic.trim()) addAlert.mutate(topic.trim());
              }}
            />
            <Button
              className="rounded-xl gap-1"
              disabled={!topic.trim() || addAlert.isPending}
              onClick={() => addAlert.mutate(topic.trim())}
            >
              <Plus className="h-4 w-4" /> Follow
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border">
              <BellRing className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground">No alerts yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Add a topic above to start tracking it.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">{a.topic}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.last_checked_at
                          ? `Last checked ${new Date(a.last_checked_at).toLocaleString()}`
                          : "Never checked"}
                      </p>
                    </div>
                    <Switch
                      checked={a.is_active}
                      onCheckedChange={(v) => toggleAlert.mutate({ id: a.id, is_active: v })}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1"
                      disabled={checking === a.id}
                      onClick={() => checkAlert(a)}
                    >
                      {checking === a.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Check
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeAlert.mutate(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {newPapers[a.id]?.length ? (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      {newPapers[a.id].map((p) => (
                        <a
                          key={p.id}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {p.source}
                            </Badge>
                            <span className="text-sm text-foreground leading-snug flex-1">{p.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ResearchAlertsPage;

import { supabase } from "@/integrations/supabase/client";

export type NewNotification = {
  title: string;
  message: string;
  type: "info" | "achievement" | "research" | "trend" | "ai";
  link?: string | null;
};

/**
 * Inserts notifications for the current user, skipping any whose title already
 * exists for that user within the given lookback window (prevents duplicates
 * when the engine runs on every app load).
 */
export const pushNotifications = async (
  userId: string,
  items: NewNotification[],
  dedupeHours = 20,
): Promise<number> => {
  if (!userId || items.length === 0) return 0;

  const since = new Date(Date.now() - dedupeHours * 3600_000).toISOString();
  const { data: existing } = await supabase
    .from("notifications")
    .select("title")
    .eq("user_id", userId)
    .gte("created_at", since);

  const seen = new Set((existing || []).map((n) => n.title));
  const fresh = items.filter((i) => !seen.has(i.title));
  if (fresh.length === 0) return 0;

  const { error } = await supabase.from("notifications").insert(
    fresh.map((i) => ({
      user_id: userId,
      title: i.title,
      message: i.message,
      type: i.type,
      link: i.link ?? null,
    })),
  );
  if (error) {
    console.error("Failed to create notifications:", error.message);
    return 0;
  }
  return fresh.length;
};

/** Notifications for reminders that are due soon or overdue. */
export const buildReminderNotifications = async (userId: string): Promise<NewNotification[]> => {
  const soon = new Date(Date.now() + 24 * 3600_000).toISOString();
  const { data } = await supabase
    .from("reminders")
    .select("id,title,due_date,priority")
    .eq("user_id", userId)
    .eq("is_completed", false)
    .lte("due_date", soon)
    .order("due_date", { ascending: true })
    .limit(10);

  return (data || []).map((r) => {
    const overdue = new Date(r.due_date).getTime() < Date.now();
    const when = new Date(r.due_date).toLocaleString();
    return {
      title: `${overdue ? "⏰ Overdue" : "🔔 Due soon"}: ${r.title}`,
      message: overdue
        ? `This reminder was due ${when}. Mark it done or reschedule it.`
        : `Scheduled for ${when} (${r.priority} priority).`,
      type: "info" as const,
      link: "/reminders",
    };
  });
};

/** Notification nudging the user about unread papers in their library. */
export const buildLibraryNotifications = async (userId: string): Promise<NewNotification[]> => {
  const { count } = await supabase
    .from("saved_papers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "to-read");

  if (!count || count < 3) return [];
  return [
    {
      title: `📚 ${count} papers waiting in your library`,
      message: "Your reading queue is filling up. Open the library to summarise or triage them.",
      type: "research",
      link: "/library",
    },
  ];
};

/** Runs active research alerts and reports genuinely new papers. */
export const buildResearchAlertNotifications = async (userId: string): Promise<NewNotification[]> => {
  const staleBefore = Date.now() - 6 * 3600_000;
  const { data: alerts } = await supabase
    .from("research_alerts")
    .select("id,topic,sources,is_active,last_checked_at,seen_ids")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(5);

  if (!alerts || alerts.length === 0) return [];

  const due = alerts.filter(
    (a) => !a.last_checked_at || new Date(a.last_checked_at).getTime() < staleBefore,
  );
  if (due.length === 0) return [];

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

  const results = await Promise.all(
    due.map(async (a) => {
      try {
        const sources = (a.sources || []).join(",");
        const url = `https://${projectId}.supabase.co/functions/v1/research-search?q=${encodeURIComponent(
          a.topic,
        )}&limit=10&offset=0${sources ? `&sources=${sources}` : ""}`;
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        const json = await res.json();
        const papers: { id: string; title: string }[] = json?.results || [];
        const seen = new Set(a.seen_ids || []);
        const fresh = papers.filter((p) => !seen.has(p.id));

        await supabase
          .from("research_alerts")
          .update({
            last_checked_at: new Date().toISOString(),
            seen_ids: Array.from(new Set([...(a.seen_ids || []), ...papers.map((p) => p.id)])).slice(-500),
          })
          .eq("id", a.id);

        if (fresh.length === 0) return null;
        return {
          title: `🆕 ${fresh.length} new paper${fresh.length > 1 ? "s" : ""} on "${a.topic}"`,
          message: fresh
            .slice(0, 3)
            .map((p) => p.title)
            .join(" • "),
          type: "research" as const,
          link: "/research-alerts",
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter(Boolean) as NewNotification[];
};

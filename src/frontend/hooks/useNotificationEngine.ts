import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchLaureates } from "@/backend/services/laureates";
import {
  pushNotifications,
  buildReminderNotifications,
  buildLibraryNotifications,
  buildResearchAlertNotifications,
  type NewNotification,
} from "@/backend/services/notifications";

const RUN_INTERVAL_MS = 15 * 60 * 1000; // re-run checks every 15 minutes

/**
 * App-wide notification engine: generates the daily digest plus reminder,
 * library and research-alert notifications, and keeps the bell live.
 */
export function useNotificationEngine(userId: string | undefined) {
  const queryClient = useQueryClient();
  const running = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notif-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notif-count"] });
    };

    const buildDaily = async (): Promise<NewNotification[]> => {
      const todayKey = `notif-daily-${userId}-${new Date().toISOString().split("T")[0]}`;
      if (localStorage.getItem(todayKey)) return [];
      try {
        const laureates = await fetchLaureates();
        if (!laureates || laureates.length === 0) return [];
        const today = new Date();
        const dayOfYear = Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
        );
        const featured = laureates[dayOfYear % laureates.length];
        localStorage.setItem(todayKey, "true");
        return [
          {
            title: `🏅 Nobel of the Day — ${featured.first_name} ${featured.last_name}`,
            message: `${featured.category}, ${featured.year} — "${featured.motivation}"`,
            type: "info",
            link: `/laureates/${featured.id}`,
          },
          {
            title: "📊 Daily Research Digest",
            message: `Explore ${laureates.filter((l) => l.category === featured.category).length} laureates in ${featured.category}. New insights await in the Discovery engine.`,
            type: "research",
            link: "/discovery",
          },
          {
            title: "🧠 AI Mentor Tip",
            message:
              "Your AI mentors are ready for deep research conversations — ask about methodology, career advice, or cross-disciplinary links.",
            type: "ai",
            link: "/mentorship",
          },
        ];
      } catch {
        return [];
      }
    };

    const run = async () => {
      if (running.current) return;
      running.current = true;
      try {
        const groups = await Promise.all([
          buildDaily(),
          buildReminderNotifications(userId),
          buildLibraryNotifications(userId),
          buildResearchAlertNotifications(userId),
        ]);
        const items = groups.flat();
        const created = await pushNotifications(userId, items);
        if (created > 0) invalidate();
      } catch (e) {
        console.error("Notification engine error:", e);
      } finally {
        running.current = false;
      }
    };

    run();
    const interval = window.setInterval(run, RUN_INTERVAL_MS);

    // Live updates whenever a notification row changes for this user
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        invalidate,
      )
      .subscribe();

    const onFocus = () => invalidate();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./auth";
import type { Json } from "@/integrations/supabase/types";

/** Tracks activity for the currently authenticated user only */
export const trackActivity = async (action: string, itemId?: string, itemType?: string, metadata?: Record<string, Json>) => {
  const user = await getCurrentUser();
  if (!user) return; // Silently skip if not authenticated

  if (!action || action.length > 100) return;

  const { error } = await supabase.from("user_activity").insert([{
    user_id: user.id,
    action,
    item_id: itemId || null,
    item_type: itemType || null,
    metadata: metadata || {},
  }]);
  if (error) console.error("Failed to track activity:", error);
};

/** Fetches activity for the currently authenticated user only */
export const fetchUserActivity = async (limit = 50) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");

  const safeLimit = Math.min(Math.max(1, limit), 200);

  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(safeLimit);
  if (error) throw new Error("Unable to load activity.");
  return data;
};

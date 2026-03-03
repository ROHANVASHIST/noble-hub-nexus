import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export const trackActivity = async (activity: TablesInsert<"user_activity">) => {
  const { error } = await supabase.from("user_activity").insert(activity);
  if (error) console.error("Failed to track activity:", error);
};

export const fetchUserActivity = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

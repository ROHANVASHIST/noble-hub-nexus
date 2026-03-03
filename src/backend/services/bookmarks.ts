import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type BookmarkRow = Tables<"bookmarks">;

export const fetchBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const addBookmark = async (bookmark: TablesInsert<"bookmarks">) => {
  const { data, error } = await supabase.from("bookmarks").insert(bookmark).select().single();
  if (error) throw error;
  return data;
};

export const removeBookmark = async (id: string) => {
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  if (error) throw error;
};

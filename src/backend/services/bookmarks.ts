import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getCurrentUser } from "./auth";

export type BookmarkRow = Tables<"bookmarks">;

/** Fetches bookmarks for the currently authenticated user only */
export const fetchBookmarks = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load bookmarks.");
  return data;
};

export const addBookmark = async (itemId: string, itemType: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");

  if (!itemId || !itemType) throw new Error("Invalid bookmark data.");
  if (itemType.length > 50) throw new Error("Invalid item type.");

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, item_id: itemId, item_type: itemType })
    .select()
    .single();
  if (error) throw new Error("Unable to add bookmark.");
  return data;
};

export const removeBookmark = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");

  // RLS ensures only own bookmarks can be deleted, but verify ownership explicitly
  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("id", id)
    .single();
  
  if (!bookmark || bookmark.user_id !== user.id) {
    throw new Error("Bookmark not found.");
  }

  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  if (error) throw new Error("Unable to remove bookmark.");
};

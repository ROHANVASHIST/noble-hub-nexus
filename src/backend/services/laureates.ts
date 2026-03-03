import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type LaureateRow = Tables<"laureates">;

export const fetchLaureates = async (category?: string) => {
  let query = supabase.from("laureates").select("*").order("year", { ascending: false });
  if (category && category !== "All") {
    query = query.eq("category", category as any);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const fetchLaureateById = async (id: string) => {
  const { data, error } = await supabase.from("laureates").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

export const searchLaureates = async (query: string) => {
  const { data, error } = await supabase
    .from("laureates")
    .select("*")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,motivation.ilike.%${query}%`)
    .order("year", { ascending: false });
  if (error) throw error;
  return data;
};

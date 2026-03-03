import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PaperRow = Tables<"research_papers">;

export const fetchPapers = async (category?: string) => {
  let query = supabase.from("research_papers").select("*").order("year", { ascending: false });
  if (category && category !== "All") {
    query = query.eq("category", category as any);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const fetchPaperById = async (id: string) => {
  const { data, error } = await supabase.from("research_papers").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

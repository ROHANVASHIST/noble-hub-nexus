import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type LectureRow = Tables<"lectures">;

export const fetchLectures = async (category?: string) => {
  let query = supabase.from("lectures").select("*").order("year", { ascending: false });
  if (category && category !== "All") {
    query = query.eq("category", category as any);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const fetchLectureById = async (id: string) => {
  const { data, error } = await supabase.from("lectures").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

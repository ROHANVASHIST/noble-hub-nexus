import { supabase } from "@/integrations/supabase/client";
import type { Tables, Enums } from "@/integrations/supabase/types";

export type LaureateRow = Tables<"laureates">;

const NOBEL_CATEGORY_MAP: Record<string, string> = {
  Physics: "phy",
  Chemistry: "che",
  Medicine: "med",
  Literature: "lit",
  Peace: "pea",
  Economics: "eco"
};

const mapNobelLaureateToRow = (l: any): LaureateRow => {
  const firstPrize = l.nobelPrizes?.[0];
  return {
    id: l.id,
    first_name: l.givenName?.en || l.knownName?.en || "Unknown",
    last_name: l.familyName?.en || "",
    birth_year: l.birth?.date ? parseInt(l.birth.date.substring(0, 4)) : 0,
    death_year: l.death?.date ? parseInt(l.death.date.substring(0, 4)) : null,
    nationality: l.birth?.place?.country?.en || "Unknown",
    category: (Object.keys(NOBEL_CATEGORY_MAP).find(k => firstPrize?.category?.en.includes(k)) || "Physics") as Enums<"nobel_category">,
    year: firstPrize ? parseInt(firstPrize.awardYear) : 0,
    motivation: firstPrize?.motivation?.en || "",
    institution: firstPrize?.affiliations?.[0]?.name?.en || "Independent",
    biography: l.wikipedia?.english || "",
    photo: `https://www.nobelprize.org/images/laureates/${l.id}-portrait-mini-2x.jpg`,
    created_at: new Date().toISOString()
  };
};

export const fetchLaureates = async (category?: string) => {
  try {
    let query = supabase.from("laureates").select("*").order("year", { ascending: false });
    if (category && category !== "All") {
      query = query.eq("category", category as Enums<"nobel_category">);
    }
    const { data, error } = await query;
    if (error) throw error;

    // If Supabase has data, return it
    if (data && data.length > 0) return data;

    // Fallback to Nobel API
    console.log("Supabase empty, fetching from Nobel API...");
    let url = "https://api.nobelprize.org/2.1/laureates?limit=50";
    if (category && category !== "All") {
      const catCode = NOBEL_CATEGORY_MAP[category] || "phy";
      url += `&nobelPrizeCategory=${catCode}`;
    }

    const response = await fetch(url);
    const apiData = await response.json();
    return apiData.laureates.map(mapNobelLaureateToRow);
  } catch (error) {
    console.error("Fetch laureates failed:", error);
    return [];
  }
};

export const fetchLaureateById = async (id: string) => {
  const { data, error } = await supabase.from("laureates").select("*").eq("id", id).single();
  if (!error && data) return data;

  // Fallback for direct ID fetch
  const response = await fetch(`https://api.nobelprize.org/2.1/laureate/${id}`);
  const apiData = await response.json();
  if (apiData && apiData[0]) return mapNobelLaureateToRow(apiData[0]);

  throw error || new Error("Laureate not found");
};

export const searchLaureates = async (query: string) => {
  const { data, error } = await supabase
    .from("laureates")
    .select("*")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,motivation.ilike.%${query}%`)
    .order("year", { ascending: false });

  if (!error && data && data.length > 0) return data;

  // Basic search fallback to Nobel API
  const response = await fetch(`https://api.nobelprize.org/2.1/laureates?name=${query}&limit=20`);
  const apiData = await response.json();
  return apiData.laureates.map(mapNobelLaureateToRow);
};

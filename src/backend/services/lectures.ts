import { supabase } from "@/integrations/supabase/client";
import type { Tables, Enums } from "@/integrations/supabase/types";

export type LectureRow = Tables<"lectures">;

export const fetchLectures = async (category?: string) => {
  try {
    let query = supabase.from("lectures").select("*").order("year", { ascending: false });
    if (category && category !== "All") {
      query = query.eq("category", category as Enums<"nobel_category">);
    }
    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) return data;

    // Fallback: Fetch latest prizes and derive lecture references
    const response = await fetch("https://api.nobelprize.org/2.1/nobelPrizes?limit=50&sort=desc");
    const apiData = await response.json();

    return apiData.nobelPrizes.map((p: any) => ({
      id: self.crypto.randomUUID ? self.crypto.randomUUID() : Math.random().toString(36),
      title: `${p.categoryFullName?.en || "Nobel"} Lecture`,
      speaker_name: p.laureates?.[0]?.knownName?.en || p.laureates?.[0]?.fullName?.en || "Multiple Laureates",
      category: (Object.keys(CATEGORY_MAP).find(k => p.category?.en?.includes(k)) || "Physics") as Enums<"nobel_category">,
      year: parseInt(p.awardYear),
      duration: "approx 45 min",
      views: Math.floor(Math.random() * 50000),
      thumbnail: `https://www.nobelprize.org/images/prizes/${p.awardYear}/nobel-prize-medal.jpg`,
      description: p.laureates?.[0]?.motivation?.en || "Nobel Prize Lecture",
      video_url: p.links?.[0]?.href || "https://www.nobelprize.org",
      created_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Fetch lectures failed:", error);
    return [];
  }
};

const CATEGORY_MAP: Record<string, string> = {
  Physics: "phy",
  Chemistry: "che",
  Medicine: "med",
  Literature: "lit",
  Peace: "pea",
  Economics: "eco"
};

export const fetchLectureById = async (id: string) => {
  const { data, error } = await supabase.from("lectures").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

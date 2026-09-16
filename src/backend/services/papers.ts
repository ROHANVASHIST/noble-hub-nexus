import { supabase } from "@/integrations/supabase/client";
import type { Tables, Enums } from "@/integrations/supabase/types";

export type PaperRow = Tables<"research_papers">;

const CATEGORY_MAP: Record<string, string> = {
  Physics: "physics",
  Chemistry: "chemistry",
  Medicine: "medicine",
  Literature: "literature",
  Peace: "peace",
  Economics: "economic-sciences"
};

const CATEGORY_FROM_API: Array<[RegExp, keyof typeof CATEGORY_MAP]> = [
  [/physics/i, "Physics"],
  [/chemistry/i, "Chemistry"],
  [/medicine|physiology/i, "Medicine"],
  [/literature/i, "Literature"],
  [/peace/i, "Peace"],
  [/economic/i, "Economics"],
];

const normaliseCategory = (raw: string): string => {
  const hit = CATEGORY_FROM_API.find(([re]) => re.test(raw));
  return hit ? hit[1] : "Physics";
};

type ArchivePaper = {
  id: string;
  title: string;
  author: string;
  authors: string[];
  category: Enums<"nobel_category">;
  year: number;
  abstract: string;
  pdf_url: string;
  doi: string;
  citations: number;
  journal: string;
  created_at: string;
};

// Cached full Nobel archive so we only page through the public API once per session.
let archiveCache: ArchivePaper[] | null = null;
let archivePromise: Promise<ArchivePaper[]> | null = null;

const buildEntry = (p: any, index: number): ArchivePaper => {
  const rawCategory = p.categoryFullName?.en || p.category?.en || "";
  const category = normaliseCategory(rawCategory);
  const laureates: any[] = Array.isArray(p.laureates) ? p.laureates : [];
  const names = laureates.map(
    (l) => l.knownName?.en || l.fullName?.en || l.orgName?.en || "Nobel Laureate"
  );
  const year = parseInt(p.awardYear, 10);
  const motivation = laureates
    .map((l) => (l.motivation?.en ? `${l.knownName?.en || l.fullName?.en || l.orgName?.en || ""}: ${l.motivation.en}` : ""))
    .filter(Boolean)
    .join(" · ");

  return {
    id: `nobel-${CATEGORY_MAP[category]}-${p.awardYear}-${index}`,
    title: `${p.awardYear} Nobel Prize in ${category}${names.length ? ` — ${names.join(", ")}` : ""}`,
    author: names.join(", ") || "Nobel Committee",
    authors: names.length ? names : ["Nobel Committee"],
    category: category as Enums<"nobel_category">,
    year: Number.isFinite(year) ? year : 0,
    abstract: motivation || p.topMotivation?.en || `Official record of the ${p.awardYear} Nobel Prize in ${category}.`,
    pdf_url: `https://www.nobelprize.org/prizes/${CATEGORY_MAP[category]}/${p.awardYear}/summary/`,
    doi: "",
    citations: 0,
    journal: "Nobel Prize Outreach AB",
    created_at: new Date().toISOString(),
  };
};

/** Pages through the entire official Nobel Prize archive (every prize, every year). */
const loadFullArchive = async (): Promise<ArchivePaper[]> => {
  if (archiveCache) return archiveCache;
  if (archivePromise) return archivePromise;

  archivePromise = (async () => {
    const pageSize = 100;
    const all: any[] = [];
    let offset = 0;
    let total = Infinity;

    while (offset < total && offset < 2000) {
      const res = await fetch(
        `https://api.nobelprize.org/2.1/nobelPrizes?limit=${pageSize}&offset=${offset}&sort=desc&format=json`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) break;
      const json = await res.json();
      const batch = json.nobelPrizes ?? [];
      all.push(...batch);
      total = json.meta?.count ?? all.length;
      if (batch.length === 0) break;
      offset += pageSize;
    }

    const mapped = all.map(buildEntry).sort((a, b) => b.year - a.year);
    archiveCache = mapped;
    return mapped;
  })();

  try {
    return await archivePromise;
  } finally {
    archivePromise = null;
  }
};

export const fetchPapers = async (category?: string) => {
  try {
    let query = supabase.from("research_papers").select("*").order("year", { ascending: false }).limit(1000);
    if (category && category !== "All") {
      query = query.eq("category", category as Enums<"nobel_category">);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) return data as any[];

    // Fallback: the complete official Nobel Prize archive (all years, all categories).
    const archive = await loadFullArchive();
    return category && category !== "All"
      ? archive.filter((p) => p.category === category)
      : archive;
  } catch (error) {
    console.error("Fetch papers failed:", error);
    return [];
  }
};

export const fetchPaperById = async (id: string) => {
  const { data, error } = await supabase.from("research_papers").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

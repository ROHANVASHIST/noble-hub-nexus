import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Environment variables should be passed via CLI/environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const generateUUID = (id: string) => {
    const hash = crypto.createHash('md5').update('nobel-' + id).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};

const CATEGORY_MAP: Record<string, string> = {
    "Economic Sciences": "Economics",
    "Physics": "Physics",
    "Chemistry": "Chemistry",
    "Physiology or Medicine": "Medicine",
    "Literature": "Literature",
    "Peace": "Peace"
};

async function syncLaureates() {
    console.log("Fetching laureates from Nobel API...");
    const response = await fetch("https://api.nobelprize.org/2.1/laureates?limit=100"); // Start with 100
    const data = await response.json();

    const laureates = data.laureates.map((l: any) => {
        const firstPrize = l.nobelPrizes?.[0];
        return {
            id: generateUUID(l.id),
            first_name: l.givenName?.en || l.knownName?.en || "Unknown",
            last_name: l.familyName?.en || "",
            birth_year: l.birth?.date ? parseInt(l.birth.date.substring(0, 4)) : 0,
            death_year: l.death?.date ? parseInt(l.death.date.substring(0, 4)) : null,
            nationality: l.birth?.place?.country?.en || "Unknown",
            category: CATEGORY_MAP[firstPrize?.category?.en] || "Physics",
            year: firstPrize ? parseInt(firstPrize.awardYear) : 0,
            motivation: firstPrize?.motivation?.en || "",
            institution: firstPrize?.affiliations?.[0]?.name?.en || "Independent",
            biography: l.wikipedia?.english || "",
            photo: `https://www.nobelprize.org/images/laureates/${l.id}-portrait-mini-2x.jpg` // Heuristic for thumbnail
        };
    });

    console.log(`Syncing ${laureates.length} laureates to Supabase...`);
    const { error } = await supabase.from("laureates").upsert(laureates);

    if (error) {
        console.error("Error syncing laureates:", error);
    } else {
        console.log("Successfully synced laureates.");
    }
}

async function main() {
    try {
        await syncLaureates();
    } catch (err) {
        console.error("Sync failed:", err);
    }
}

main();

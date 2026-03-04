import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchLaureates } from "@/backend/services/laureates";
import OrteliusNavigator from "@/frontend/components/OrteliusNavigator";
import { Loader2, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

const LaureatesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "ortelius">("grid");

  const { data: laureates, isLoading } = useQuery({
    queryKey: ["laureates", selectedCategory],
    queryFn: () => fetchLaureates(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const filtered = (laureates || []).filter((l) => {
    const matchSearch = `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Nobel Laureates</h1>
          <p className="mt-2 text-muted-foreground">Explore 1000+ laureates across 125 years of Nobel history.</p>
        </motion.div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laureates..."
            className="h-10 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none w-full md:w-64"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory("All");
                toast.info("Viewing all laureates");
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setSelectedCategory(c.name);
                  toast.success(`Filtering for ${c.name}`);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === c.name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching laureates from official records...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mt-6 mb-4">
              <p className="text-sm font-medium text-muted-foreground">Found {filtered.length} laureates</p>
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("ortelius")}
                  className={`flex items-center gap-1 p-1.5 px-3 rounded-md transition-all ${viewMode === "ortelius" ? "bg-amber-500/10 text-amber-500 shadow-sm font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                  title="Ortelius Navigator"
                >
                  <List className="h-4 w-4" /> <span className="text-[10px] uppercase tracking-widest hidden sm:inline">Ortelius Navigator</span>
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filtered.map((l, i) => (
                  <LaureateCard
                    key={l.id}
                    laureate={{
                      id: l.id,
                      firstName: l.first_name,
                      lastName: l.last_name,
                      birthYear: l.birth_year,
                      deathYear: l.death_year || undefined,
                      nationality: l.nationality,
                      category: l.category as NobelCategory,
                      year: l.year,
                      motivation: l.motivation,
                      institution: l.institution,
                      photo: l.photo || "",
                      biography: l.biography || ""
                    } as any}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <OrteliusNavigator laureates={filtered} />
              </div>
            )}

            {filtered.length === 0 && (
              <p className="mt-12 text-center text-muted-foreground">No laureates found matching your search.</p>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default LaureatesPage;

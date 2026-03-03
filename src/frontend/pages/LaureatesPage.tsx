import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import { LAUREATES, CATEGORIES, NobelCategory } from "@/backend/data/mock-data";

const LaureatesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = LAUREATES.filter((l) => {
    const matchCategory = selectedCategory === "All" || l.category === selectedCategory;
    const matchSearch = `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Nobel Laureates</h1>
          <p className="mt-2 text-muted-foreground">Explore 971+ laureates across 125 years of Nobel history.</p>
        </motion.div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laureates..."
            className="h-10 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(c.name)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === c.name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l, i) => (
            <LaureateCard key={l.id} laureate={l} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No laureates found matching your search.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default LaureatesPage;

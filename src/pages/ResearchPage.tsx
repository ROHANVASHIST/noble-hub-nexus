import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import PaperCard from "@/components/cards/PaperCard";
import { PAPERS, CATEGORIES, NobelCategory } from "@/data/mock-data";

const ResearchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");

  const filtered = PAPERS.filter((p) => selectedCategory === "All" || p.category === selectedCategory);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Research Papers</h1>
          <p className="mt-2 text-muted-foreground">Browse Nobel Prize-related publications and landmark research papers.</p>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-2">
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

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {filtered.map((p, i) => (
            <PaperCard key={p.id} paper={p} index={i} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ResearchPage;

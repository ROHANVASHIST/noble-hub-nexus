import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import LectureCard from "@/components/cards/LectureCard";
import { LECTURES, CATEGORIES, NobelCategory } from "@/data/mock-data";

const LecturesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");

  const filtered = LECTURES.filter((l) => selectedCategory === "All" || l.category === selectedCategory);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Lecture Library</h1>
          <p className="mt-2 text-muted-foreground">Watch Nobel Prize lectures, presentations, and educational content.</p>
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

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l, i) => (
            <LectureCard key={l.id} lecture={l} index={i} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default LecturesPage;

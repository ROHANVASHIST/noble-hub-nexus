import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import PaperCard from "@/frontend/components/cards/PaperCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchPapers } from "@/backend/services/papers";
import { Loader2 } from "lucide-react";

const ResearchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");

  const { data: papers, isLoading } = useQuery({
    queryKey: ["papers", selectedCategory],
    queryFn: () => fetchPapers(selectedCategory === "All" ? undefined : selectedCategory),
  });

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
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCategory(c.name)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === c.name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Retrieving research archives...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {papers?.map((p: any, i: number) => (
              <PaperCard
                key={p.id}
                paper={{
                  id: p.id,
                  title: p.title,
                  author: p.author,
                  category: p.category as NobelCategory,
                  year: p.year,
                  abstract: p.abstract,
                  pdfUrl: p.pdf_url,
                  doi: p.doi,
                  citations: p.citations
                } as any}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ResearchPage;

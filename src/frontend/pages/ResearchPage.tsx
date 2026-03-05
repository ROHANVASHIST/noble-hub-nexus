import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import PaperCard from "@/frontend/components/cards/PaperCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchPapers } from "@/backend/services/papers";
import { Loader2, Search, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ResearchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scholarMode, setScholarMode] = useState(false);

  const { data: papers, isLoading } = useQuery({
    queryKey: ["papers", selectedCategory],
    queryFn: () => fetchPapers(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const filteredPapers = useMemo(() => {
    if (!papers) return [];
    return papers.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [papers, searchQuery]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl font-bold text-foreground">Research Archive</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Access the seminal publications and landmark papers that formed the foundation for Nobel Prize recognition.
            </p>
          </motion.div>

          <div className="hidden md:flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {filteredPapers.length} Papers indexed
            </span>
          </div>
          {/* Scholar Mode Toggle */}
          <div className="flex items-center gap-3 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20 ml-4 group cursor-pointer" onClick={() => {
            setScholarMode(!scholarMode);
            toast(scholarMode ? "Scholar mode deactivated" : "Scholar mode activated - Highlighted tools available", {
              icon: <Sparkles className="h-4 w-4 text-amber-500" />
            });
          }}>
            <Sparkles className={`h-4 w-4 transition-all ${scholarMode ? "text-amber-500 scale-125" : "text-muted-foreground group-hover:text-amber-500"}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${scholarMode ? "text-amber-600" : "text-muted-foreground"}`}>Scholar Mode</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or research topic..."
              className="h-12 w-full rounded-2xl border border-border bg-card/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory("All");
                toast.info("Viewing all research areas");
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === "All" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
            >
              All Areas
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setSelectedCategory(c.name);
                  toast.success(`Showing ${c.name} papers`);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === c.name ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card text-muted-foreground hover:text-foreground border border-border"
                  }`}
              >
                <span className="opacity-70">{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-32 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 animate-ping bg-primary/20 rounded-full" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">Accessing Research Databases...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            {filteredPapers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {filteredPapers.map((p: any, i: number) => (
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
                </AnimatePresence>
                {scholarMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="md:col-span-2 mt-4 p-4 bg-amber-500/5 border border-amber-500/20 border-dashed rounded-2xl text-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600"
                  >
                    AI Summarization & BibTeX Export Tools are now prioritized in your view.
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="mt-20 flex flex-col items-center text-center p-12 rounded-3xl bg-secondary/20 border border-border border-dashed">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground">No Research Papers Found</h3>
                <p className="mt-2 text-muted-foreground">
                  No publications match your filter criteria in the field of {selectedCategory}.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default ResearchPage;


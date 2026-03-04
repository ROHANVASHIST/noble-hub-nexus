import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, SlidersHorizontal, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import LectureCard from "@/frontend/components/cards/LectureCard";
import PaperCard from "@/frontend/components/cards/PaperCard";
import { fetchLaureates } from "@/backend/services/laureates";
import { fetchLectures } from "@/backend/services/lectures";
import { fetchPapers } from "@/backend/services/papers";
import { NobelCategory } from "@/backend/data/mock-data";

type ContentType = "all" | "laureates" | "lectures" | "papers";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("all");

  const { data: laureates, isLoading: loadingLaureates } = useQuery({
    queryKey: ["all-laureates"],
    queryFn: () => fetchLaureates(),
    staleTime: 1000 * 60 * 5 // 5 mins
  });

  const { data: lectures, isLoading: loadingLectures } = useQuery({
    queryKey: ["all-lectures"],
    queryFn: () => fetchLectures(),
    staleTime: 1000 * 60 * 5
  });

  const { data: papers, isLoading: loadingPapers } = useQuery({
    queryKey: ["all-papers"],
    queryFn: () => fetchPapers(),
    staleTime: 1000 * 60 * 5
  });

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { laureates: [], lectures: [], papers: [] };

    return {
      laureates: (laureates || []).filter(
        (l) =>
          `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.motivation.toLowerCase().includes(q) ||
          l.nationality.toLowerCase().includes(q) ||
          l.year.toString().includes(q)
      ),
      lectures: (lectures || []).filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.speaker_name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      ),
      papers: (papers || []).filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q)
      ),
    };
  }, [query, laureates, lectures, papers]);

  const isLoading = loadingLaureates || loadingLectures || loadingPapers;
  const totalResults = results.laureates.length + results.lectures.length + results.papers.length;

  const TABS: { key: ContentType; label: string; count: number }[] = [
    { key: "all", label: "Unified Results", count: totalResults },
    { key: "laureates", label: "Laureates", count: results.laureates.length },
    { key: "lectures", label: "Lectures", count: results.lectures.length },
    { key: "papers", label: "Papers", count: results.papers.length },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Cross-Archive Discovery</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Universal Search
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Query across a century of human achievement. Find laureates, papers, and lectures instantly.
          </p>

          <div className="relative mt-10 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-amber-500/50 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, discovery, year, or nationality..."
                className="h-16 w-full rounded-2xl border border-border bg-card/80 backdrop-blur-md pl-14 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                autoFocus
              />
              {isLoading && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {query && (
          <div className="mt-12 space-y-12">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setContentType(tab.key);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all border ${contentType === tab.key
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                >
                  {tab.label} <span className="ml-1 opacity-60">[{tab.count}]</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={contentType + query}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                {(contentType === "all" || contentType === "laureates") && results.laureates.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                      <h3 className="font-display text-2xl font-bold text-foreground">Nobel Laureates</h3>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{results.laureates.length} matches</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {results.laureates.map((l, i) => (
                        <LaureateCard
                          key={l.id}
                          laureate={{
                            ...l,
                            firstName: l.first_name,
                            lastName: l.last_name,
                            birthYear: l.birth_year,
                            deathYear: l.death_year || undefined,
                            category: l.category as NobelCategory,
                          } as any}
                          index={i}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {(contentType === "all" || contentType === "lectures") && results.lectures.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                      <h3 className="font-display text-2xl font-bold text-foreground">Official Lectures</h3>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{results.lectures.length} matches</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {results.lectures.map((l, i) => (
                        <LectureCard
                          key={l.id}
                          lecture={{
                            ...l,
                            speakerName: l.speaker_name,
                            category: l.category as NobelCategory,
                          } as any}
                          index={i}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {(contentType === "all" || contentType === "papers") && results.papers.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                      <h3 className="font-display text-2xl font-bold text-foreground">Research Archive</h3>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{results.papers.length} matches</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {results.papers.map((p, i) => (
                        <PaperCard
                          key={p.id}
                          paper={{
                            ...p,
                            category: p.category as NobelCategory,
                          } as any}
                          index={i}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {totalResults === 0 && !isLoading && (
                  <div className="text-center py-24 rounded-3xl bg-secondary/20 border border-dashed border-border max-w-lg mx-auto">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Refine your query</h3>
                    <p className="mt-2 text-muted-foreground">
                      We couldn't find any documents matching "{query}". Try searching for specific years (e.g., "1921") or broader categories.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-24 text-center"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Popular Search Terms</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {["Quantum Physics", "Peace", "Economics 2023", "Marie Curie", "Literature", "Vaccine"].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-6 py-3 rounded-2xl bg-card border border-border hover:border-primary/50 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;


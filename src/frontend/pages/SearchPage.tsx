import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import LectureCard from "@/frontend/components/cards/LectureCard";
import PaperCard from "@/frontend/components/cards/PaperCard";
import { LAUREATES, LECTURES, PAPERS } from "@/backend/data/mock-data";

type ContentType = "all" | "laureates" | "lectures" | "papers";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("all");

  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return { laureates: [], lectures: [], papers: [] };

    return {
      laureates: LAUREATES.filter(
        (l) =>
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.motivation.toLowerCase().includes(q)
      ),
      lectures: LECTURES.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.speakerName.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      ),
      papers: PAPERS.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      ),
    };
  }, [query]);

  const totalResults = results.laureates.length + results.lectures.length + results.papers.length;

  const TABS: { key: ContentType; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalResults },
    { key: "laureates", label: "Laureates", count: results.laureates.length },
    { key: "lectures", label: "Lectures", count: results.lectures.length },
    { key: "papers", label: "Papers", count: results.papers.length },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Search NobelHub</h1>
          <p className="mt-2 text-muted-foreground">Find laureates, lectures, and research papers.</p>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, topic..."
              className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              autoFocus
            />
          </div>
        </motion.div>

        {query && (
          <>
            <div className="mt-8 flex items-center justify-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setContentType(tab.key);
                    toast.info(`Filtering results: ${tab.label}`);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${contentType === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-8">
              {(contentType === "all" || contentType === "laureates") && results.laureates.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">Laureates</h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {results.laureates.map((l, i) => <LaureateCard key={l.id} laureate={l} index={i} />)}
                  </div>
                </div>
              )}
              {(contentType === "all" || contentType === "lectures") && results.lectures.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">Lectures</h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {results.lectures.map((l, i) => <LectureCard key={l.id} lecture={l} index={i} />)}
                  </div>
                </div>
              )}
              {(contentType === "all" || contentType === "papers") && results.papers.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">Papers</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {results.papers.map((p, i) => <PaperCard key={p.id} paper={p} index={i} />)}
                  </div>
                </div>
              )}
              {totalResults === 0 && (
                <p className="text-center text-muted-foreground py-12">No results found for "{query}". Try a different search term.</p>
              )}
            </div>
          </>
        )}

        {!query && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Try searching for "Einstein", "Physics", or "Malaria"</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;

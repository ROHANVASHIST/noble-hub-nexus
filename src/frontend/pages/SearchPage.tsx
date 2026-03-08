import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bookmark, BookmarkCheck, ArrowRight, Award, BookOpen, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import LectureCard from "@/frontend/components/cards/LectureCard";
import PaperCard from "@/frontend/components/cards/PaperCard";
import SearchAutocomplete from "@/frontend/components/search/SearchAutocomplete";
import FacetedFilters, { type SearchFilters } from "@/frontend/components/search/FacetedFilters";
import { useSearchHistory } from "@/frontend/hooks/useSearchHistory";
import { fetchLaureates } from "@/backend/services/laureates";
import { fetchLectures } from "@/backend/services/lectures";
import { fetchPapers } from "@/backend/services/papers";
import { NobelCategory } from "@/backend/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


type ContentType = "all" | "laureates" | "lectures" | "papers";

const SAVED_SEARCHES_KEY = "nobel-saved-searches";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    yearRange: [1901, 2025],
    nationalities: [],
    contentTypes: [],
  });
  const [savedSearches, setSavedSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || "[]"); } catch { return []; }
  });

  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Save search on "enter" or after 2s of no typing with a valid query
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      const t = setTimeout(() => addSearch(debouncedQuery), 2000);
      return () => clearTimeout(t);
    }
  }, [debouncedQuery, addSearch]);

  const { data: laureates, isLoading: loadingLaureates } = useQuery({
    queryKey: ["all-laureates"],
    queryFn: () => fetchLaureates(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: lectures, isLoading: loadingLectures } = useQuery({
    queryKey: ["all-lectures"],
    queryFn: () => fetchLectures(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: papers, isLoading: loadingPapers } = useQuery({
    queryKey: ["all-papers"],
    queryFn: () => fetchPapers(),
    staleTime: 1000 * 60 * 5,
  });

  // Generate autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    const q = debouncedQuery.toLowerCase();
    const matches = new Set<string>();

    (laureates || []).forEach(l => {
      const name = `${l.first_name} ${l.last_name}`;
      if (name.toLowerCase().includes(q)) matches.add(name);
      if (l.category.toLowerCase().includes(q)) matches.add(l.category);
      if (l.nationality.toLowerCase().includes(q)) matches.add(`${l.nationality} laureates`);
    });
    (lectures || []).forEach(l => {
      if (l.title.toLowerCase().includes(q)) matches.add(l.title);
    });
    (papers || []).forEach(p => {
      if (p.title.toLowerCase().includes(q)) matches.add(p.title);
    });

    return Array.from(matches).slice(0, 10);
  }, [debouncedQuery, laureates, lectures, papers]);

  // Filter results
  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return { laureates: [], lectures: [], papers: [] };

    const matchCategory = (cat: string) => filters.categories.length === 0 || filters.categories.includes(cat);
    const matchYear = (year: number) => year >= filters.yearRange[0] && year <= filters.yearRange[1];
    const matchNationality = (nat: string) => filters.nationalities.length === 0 || filters.nationalities.some(n => nat.toLowerCase().includes(n.toLowerCase()));

    const filteredLaureates = (filters.contentTypes.length === 0 || filters.contentTypes.includes("laureates"))
      ? (laureates || []).filter(l =>
          (`${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
           l.category.toLowerCase().includes(q) ||
           l.motivation.toLowerCase().includes(q) ||
           l.nationality.toLowerCase().includes(q) ||
           l.year.toString().includes(q)) &&
          matchCategory(l.category) && matchYear(l.year) && matchNationality(l.nationality)
        )
      : [];

    const filteredLectures = (filters.contentTypes.length === 0 || filters.contentTypes.includes("lectures"))
      ? (lectures || []).filter(l =>
          (l.title.toLowerCase().includes(q) ||
           l.speaker_name.toLowerCase().includes(q) ||
           l.category.toLowerCase().includes(q) ||
           (l.description && l.description.toLowerCase().includes(q))) &&
          matchCategory(l.category) && matchYear(l.year)
        )
      : [];

    const filteredPapers = (filters.contentTypes.length === 0 || filters.contentTypes.includes("papers"))
      ? (papers || []).filter(p =>
          (p.title.toLowerCase().includes(q) ||
           (p.authors && p.authors.some(a => a.toLowerCase().includes(q))) ||
           p.category.toLowerCase().includes(q) ||
           (p.abstract && p.abstract.toLowerCase().includes(q))) &&
          matchCategory(p.category) && matchYear(p.year)
        )
      : [];

    return { laureates: filteredLaureates, lectures: filteredLectures, papers: filteredPapers };
  }, [debouncedQuery, laureates, lectures, papers, filters]);

  const isLoading = loadingLaureates || loadingLectures || loadingPapers;
  const totalResults = results.laureates.length + results.lectures.length + results.papers.length;

  const toggleSaveSearch = (term: string) => {
    setSavedSearches(prev => {
      const next = prev.includes(term) ? prev.filter(s => s !== term) : [...prev, term];
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
      toast.success(next.includes(term) ? "Search saved!" : "Search removed");
      return next;
    });
  };

  const TABS: { key: ContentType; label: string; count: number; icon: typeof Award }[] = [
    { key: "all", label: "All", count: totalResults, icon: Sparkles },
    { key: "laureates", label: "Laureates", count: results.laureates.length, icon: Award },
    { key: "lectures", label: "Lectures", count: results.lectures.length, icon: BookOpen },
    { key: "papers", label: "Papers", count: results.papers.length, icon: FileText },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
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
            Query across a century of human achievement with smart autocomplete, filters, and saved searches.
          </p>

          <div className="mt-10">
            <SearchAutocomplete
              value={query}
              onChange={(val) => { setQuery(val); if (val.length >= 3) addSearch(val); }}
              suggestions={suggestions}
              recentSearches={history}
              onClearRecent={clearHistory}
              onRemoveRecent={removeSearch}
              isLoading={isLoading}
            />
          </div>
        </motion.div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && !debouncedQuery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              <BookmarkCheck className="inline h-3 w-3 mr-1" /> Saved Searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {savedSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm font-semibold text-foreground hover:bg-primary/10 transition-all"
                >
                  <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Area */}
        {debouncedQuery && (
          <div className="mt-10 space-y-6">
            {/* Faceted Filters */}
            <FacetedFilters
              filters={filters}
              onChange={setFilters}
              resultCounts={{ laureates: results.laureates.length, lectures: results.lectures.length, papers: results.papers.length }}
              isVisible={showFilters}
              onToggle={() => setShowFilters(v => !v)}
            />

            {/* Result header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-foreground">
                  <span className="text-primary">{totalResults}</span> results for "<span className="text-primary">{debouncedQuery}</span>"
                </h2>
                <button onClick={() => toggleSaveSearch(debouncedQuery)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Save search">
                  {savedSearches.includes(debouncedQuery)
                    ? <BookmarkCheck className="h-4 w-4 text-primary" />
                    : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>

              <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <TabsList className="rounded-xl h-9">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.key} value={tab.key} className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-sm">
                      <tab.icon className="h-3 w-3" />
                      {tab.label}
                      <Badge variant="secondary" className="h-4 min-w-4 px-1 rounded-full text-[9px]">{tab.count}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Results Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={contentType + debouncedQuery + JSON.stringify(filters)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-12"
              >
                {(contentType === "all" || contentType === "laureates") && results.laureates.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                      <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" /> Nobel Laureates
                      </h3>
                      <Badge variant="outline" className="rounded-full">{results.laureates.length}</Badge>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {results.laureates.slice(0, contentType === "all" ? 6 : 30).map((l, i) => (
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
                    {contentType === "all" && results.laureates.length > 6 && (
                      <button onClick={() => setContentType("laureates")} className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline mx-auto">
                        View all {results.laureates.length} laureates <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </section>
                )}

                {(contentType === "all" || contentType === "lectures") && results.lectures.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                      <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> Lectures
                      </h3>
                      <Badge variant="outline" className="rounded-full">{results.lectures.length}</Badge>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {results.lectures.slice(0, contentType === "all" ? 6 : 30).map((l, i) => (
                        <LectureCard
                          key={l.id}
                          lecture={{ ...l, speakerName: l.speaker_name, category: l.category as NobelCategory } as any}
                          index={i}
                        />
                      ))}
                    </div>
                    {contentType === "all" && results.lectures.length > 6 && (
                      <button onClick={() => setContentType("lectures")} className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline mx-auto">
                        View all {results.lectures.length} lectures <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </section>
                )}

                {(contentType === "all" || contentType === "papers") && results.papers.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                      <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" /> Research Papers
                      </h3>
                      <Badge variant="outline" className="rounded-full">{results.papers.length}</Badge>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      {results.papers.slice(0, contentType === "all" ? 4 : 30).map((p, i) => (
                        <PaperCard
                          key={p.id}
                          paper={{ ...p, category: p.category as NobelCategory } as any}
                          index={i}
                        />
                      ))}
                    </div>
                    {contentType === "all" && results.papers.length > 4 && (
                      <button onClick={() => setContentType("papers")} className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline mx-auto">
                        View all {results.papers.length} papers <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </section>
                )}

                {totalResults === 0 && !isLoading && (
                  <div className="text-center py-20 rounded-3xl bg-muted/20 border border-dashed border-border max-w-lg mx-auto">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No results found</h3>
                    <p className="mt-2 text-muted-foreground text-sm">
                      Try adjusting your filters or search for a different term.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Empty state - Popular & Quick Links */}
        {!debouncedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 space-y-12"
          >
            <div className="text-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Popular Searches</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {["Quantum Physics", "Peace", "Economics 2023", "Marie Curie", "Literature", "Vaccine", "CRISPR", "Climate"].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-5 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 text-sm font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-md"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Discovery Feed */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 text-center">Discover Today</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                {(laureates || []).slice(0, 3).map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    onClick={() => setQuery(`${l.first_name} ${l.last_name}`)}
                    className="group p-5 rounded-2xl border border-border bg-card/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Badge variant="outline" className="rounded-full mb-3 text-[10px]">{l.category}</Badge>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{l.first_name} {l.last_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.motivation}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{l.year} · {l.nationality}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;

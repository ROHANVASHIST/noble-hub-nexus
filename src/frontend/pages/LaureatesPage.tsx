import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchLaureates } from "@/backend/services/laureates";
import OrteliusNavigator from "@/frontend/components/OrteliusNavigator";
import ComparisonModal from "@/frontend/components/ComparisonModal";
import { Loader2, LayoutGrid, List, Download, ArrowRightLeft, Sparkles, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToJSON } from "@/lib/export-utils";
import { Button } from "@/components/ui/button";

const LaureatesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "ortelius">("grid");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const { data: laureates, isLoading } = useQuery({
    queryKey: ["laureates", selectedCategory],
    queryFn: () => fetchLaureates(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const filtered = useMemo(() => {
    return (laureates || []).filter((l) => {
      const matchSearch = `${l.first_name} ${l.last_name} ${l.motivation} ${l.nationality}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [laureates, searchQuery]);

  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) {
        toast.warning("You can only compare 2 laureates at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length !== 2) {
      toast.error("Please select exactly 2 laureates to compare.");
      return;
    }
    setIsComparisonOpen(true);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filtered.map(l => ({
      id: l.id,
      name: `${l.first_name} ${l.last_name}`,
      category: l.category,
      year: l.year,
      nationality: l.nationality,
      motivation: l.motivation
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, `nobel-laureates-${selectedCategory.toLowerCase()}`);
    } else {
      exportToJSON(dataToExport, `nobel-laureates-${selectedCategory.toLowerCase()}`);
    }
    toast.success(`Exported ${filtered.length} laureates to ${format.toUpperCase()}`);
  };

  const handleSurpriseMe = () => {
    if (laureates && laureates.length > 0) {
      const random = laureates[Math.floor(Math.random() * laureates.length)];
      navigate(`/laureates/${random.id}`);
      toast.success(`Discovering ${random.first_name} ${random.last_name}`);
    }
  };

  const selectedLaureates = useMemo(() => {
    return (laureates || []).filter(l => selectedIds.includes(l.id)).map(l => ({
      id: l.id,
      firstName: l.first_name,
      lastName: l.last_name,
      year: l.year,
      category: l.category as NobelCategory,
      motivation: l.motivation,
      nationality: l.nationality,
      institution: l.institution,
      photo: l.photo,
      biography: l.biography
    }));
  }, [laureates, selectedIds]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-display text-4xl font-bold text-foreground">Nobel Laureates</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Traverse through a century of human excellence. Explore 1,000+ visionaries whose work redefined our world.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleSurpriseMe}
              className="rounded-full gap-2 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 transition-all"
            >
              <Sparkles className="h-4 w-4" /> Surprise Me
            </Button>
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('csv')}
                className="h-8 rounded-full px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-background"
              >
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('json')}
                className="h-8 rounded-full px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-background"
              >
                JSON
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr,auto]">
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, discovery, or nationality..."
                className="h-12 w-full rounded-2xl border border-border bg-card/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  toast.info("Viewing all laureates");
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === "All" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card text-muted-foreground hover:text-foreground border border-border"
                  }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCategory(c.name);
                    toast.success(`Filtering for ${c.name}`);
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === c.name ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card text-muted-foreground hover:text-foreground border border-border"
                    }`}
                >
                  <span className="opacity-70">{c.icon}</span> {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center">
            <button
              onClick={toggleCompareMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${isCompareMode ? 'bg-primary border-primary text-primary-foreground shadow-xl' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
            >
              <ArrowRightLeft className="h-4 w-4" /> Compare {selectedIds.length > 0 && `(${selectedIds.length}/2)`}
            </button>
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1.5 border border-border/50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("ortelius")}
                className={`flex items-center gap-2 p-2 px-3 rounded-lg transition-all ${viewMode === "ortelius" ? "bg-amber-500/10 text-amber-500 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                title="Ortelius Navigator"
              >
                <List className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Navigator</span>
              </button>
            </div>
          </div>
        </div>

        {isCompareMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-6"
          >
            <div className="text-sm">
              <span className="font-bold text-primary">{selectedIds.length}</span> / 2 selected for comparison
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCompare} disabled={selectedIds.length !== 2} className="rounded-full px-6">
                Compare Now
              </Button>
              <Button variant="ghost" onClick={toggleCompareMode} className="rounded-full">Cancel</Button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="mt-32 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 animate-ping bg-primary/20 rounded-full" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Consulting the Nobel Archives...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Displaying <span className="text-foreground">{filtered.length}</span> Records
              </h2>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
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
                      isCompareMode={isCompareMode}
                      isSelected={selectedIds.includes(l.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-card/30 rounded-3xl border border-border p-8 min-h-[600px]">
                <OrteliusNavigator laureates={filtered} />
              </div>
            )}

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-20 flex flex-col items-center text-center p-12 rounded-3xl bg-secondary/20 border border-border border-dashed"
              >
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No matches found in our local database</h3>
                <p className="mt-2 text-muted-foreground max-w-md">
                  We couldn't find any laureates matching "{searchQuery}". The Nobel archives are vast, try searching the official Nobel Prize website for more niche records.
                </p>
                <div className="mt-8 flex gap-4">
                  <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
                  <a
                    href={`https://www.nobelprize.org/search/?s=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      Search Nobel.org <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        laureates={selectedLaureates}
      />
    </PageLayout>
  );
};

export default LaureatesPage;


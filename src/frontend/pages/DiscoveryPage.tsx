import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { fetchLaureates } from "@/backend/services/laureates";
import { NobelCategory } from "@/backend/data/mock-data";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Award, Globe, Calendar, GraduationCap, Users, X, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ALL_CATEGORIES: NobelCategory[] = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"];

const NATIONALITIES = [
  "American", "British", "German", "French", "Swedish", "Japanese", "Russian", "Swiss", "Canadian",
  "Chinese", "Indian", "Australian", "Italian", "Dutch", "Danish", "Norwegian", "Polish", "Austrian",
  "Israeli", "Pakistani", "Colombian", "South African",
];

const INSTITUTIONS = [
  "Harvard University", "MIT", "Stanford University", "Cambridge University", "Oxford University",
  "Caltech", "Princeton University", "UC Berkeley", "Columbia University", "University of Chicago",
  "Max Planck Institute", "University of Paris", "ETH Zurich", "Yale University",
];

const DiscoveryPage = () => {
  const { data: laureates, isLoading } = useQuery({
    queryKey: ["all-laureates-discovery"],
    queryFn: () => fetchLaureates(),
  });

  const [categories, setCategories] = useState<NobelCategory[]>([]);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1901, 2025]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<"year" | "name" | "country">("year");

  const toggleCategory = (cat: NobelCategory) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  const toggleNationality = (nat: string) => {
    setNationalities(prev => prev.includes(nat) ? prev.filter(n => n !== nat) : [...prev, nat]);
  };

  const filtered = useMemo(() => {
    if (!laureates) return [];
    return laureates.filter(l => {
      if (categories.length > 0 && !categories.includes(l.category as NobelCategory)) return false;
      if (nationalities.length > 0 && !nationalities.some(n => l.nationality.toLowerCase().includes(n.toLowerCase()))) return false;
      if (l.year < yearRange[0] || l.year > yearRange[1]) return false;
      if (searchKeyword) {
        const q = searchKeyword.toLowerCase();
        if (!`${l.first_name} ${l.last_name} ${l.motivation} ${l.nationality} ${l.institution}`.toLowerCase().includes(q)) return false;
      }
      if (institutionFilter && !l.institution.toLowerCase().includes(institutionFilter.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "year") return b.year - a.year;
      if (sortBy === "name") return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      return a.nationality.localeCompare(b.nationality);
    });
  }, [laureates, categories, nationalities, yearRange, searchKeyword, institutionFilter, sortBy]);

  const activeFilterCount = categories.length + nationalities.length + (searchKeyword ? 1 : 0) + (institutionFilter ? 1 : 0) + (yearRange[0] !== 1901 || yearRange[1] !== 2025 ? 1 : 0);

  const clearAll = () => {
    setCategories([]);
    setNationalities([]);
    setYearRange([1901, 2025]);
    setSearchKeyword("");
    setInstitutionFilter("");
    toast.info("All filters cleared");
  };

  // Stats for current filter
  const stats = useMemo(() => {
    const countries = new Set(filtered.map(l => l.nationality));
    const decades = new Set(filtered.map(l => `${Math.floor(l.year / 10) * 10}s`));
    return { count: filtered.length, countries: countries.size, decades: decades.size };
  }, [filtered]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Deep Discovery Engine</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Advanced Discovery</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">Apply compound filters to find exactly the laureates you're looking for.</p>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px,1fr]">
          {/* Filters Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Filters
                {activeFilterCount > 0 && <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold">{activeFilterCount}</span>}
              </h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3 mr-1" /> Clear All
                </Button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  placeholder="Search achievements, names..."
                  className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-1">
                <Award className="h-3 w-3" /> Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${categories.includes(cat) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Year Range: {yearRange[0]} — {yearRange[1]}
              </label>
              <div className="px-2">
                <Slider
                  min={1901}
                  max={2025}
                  step={1}
                  value={yearRange}
                  onValueChange={(val) => setYearRange(val as [number, number])}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Nationalities */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-1">
                <Globe className="h-3 w-3" /> Nationalities
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {NATIONALITIES.map(nat => (
                  <button
                    key={nat}
                    onClick={() => toggleNationality(nat)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all border ${nationalities.includes(nat) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}
                  >
                    {nat}
                  </button>
                ))}
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> Institution
              </label>
              <input
                type="text"
                value={institutionFilter}
                onChange={e => setInstitutionFilter(e.target.value)}
                placeholder="e.g. Harvard, MIT..."
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Quick Presets</label>
              <div className="space-y-2">
                {[
                  { label: "Women in Science", fn: () => { setCategories(["Physics", "Chemistry", "Medicine"]); setSearchKeyword(""); } },
                  { label: "21st Century Winners", fn: () => { setYearRange([2000, 2025]); setCategories([]); } },
                  { label: "Peace Pioneers", fn: () => { setCategories(["Peace"]); setYearRange([1901, 2025]); } },
                  { label: "Economics Masters", fn: () => { setCategories(["Economics"]); setYearRange([1969, 2025]); } },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => { clearAll(); preset.fn(); toast.success(`Applied: ${preset.label}`); }}
                    className="w-full text-left px-3 py-2 rounded-xl border border-border bg-card/50 text-xs font-bold hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="text-foreground">{stats.count}</span> laureates · <span className="text-foreground">{stats.countries}</span> countries · <span className="text-foreground">{stats.decades}</span> decades
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {(["year", "name", "country"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${sortBy === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 rounded-3xl bg-secondary/20 border border-dashed border-border">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">No laureates match your filters</h3>
                <p className="mt-2 text-muted-foreground text-sm">Try adjusting your criteria or use a preset.</p>
                <Button variant="outline" onClick={clearAll} className="mt-4 rounded-xl">Clear Filters</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filtered.slice(0, 50).map((l, i) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    >
                      <Link to={`/laureates/${l.id}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <Award className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{l.first_name} {l.last_name}</h3>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{l.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{l.nationality} · {l.year} · {l.institution}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filtered.length > 50 && (
                  <p className="text-center text-xs text-muted-foreground py-4">Showing first 50 of {filtered.length} results. Refine your filters to see more specific results.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DiscoveryPage;

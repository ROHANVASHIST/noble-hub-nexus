import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import PaperCard from "@/frontend/components/cards/PaperCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchPapers } from "@/backend/services/papers";
import { Loader2, Search, FileText, Sparkles, Download, BookOpen, Brain, Microscope, FlaskConical, Lightbulb, ArrowRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScholarData } from "@/frontend/hooks/useScholarData";

const SCHOLAR_TOOLS = [
  {
    category: "Discovery",
    tools: [
      { id: "semantic-search", name: "Semantic Search", desc: "AI-powered deep research query", icon: Search },
      { id: "pdf-parser", name: "Upload & Parse PDF", desc: "Extract insights from papers", icon: FileText },
      { id: "gap-analysis", name: "Find Research Gaps", desc: "Identify unexplored areas", icon: Lightbulb },
      { id: "trend-analysis", name: "Trend Analysis", desc: "Track emerging research trends", icon: BarChart3 },
    ],
  },
  {
    category: "Understanding",
    tools: [
      { id: "limitation-extractor", name: "Extract Limitations", desc: "Find paper limitations", icon: Microscope },
      { id: "equation-explainer", name: "Explain Equations", desc: "Break down complex formulas", icon: Brain },
      { id: "compare-papers", name: "Compare Papers", desc: "Side-by-side analysis", icon: BookOpen },
      { id: "methodology-review", name: "Methodology Review", desc: "Evaluate research methods", icon: FlaskConical },
    ],
  },
  {
    category: "Writing",
    tools: [
      { id: "tone-checker", name: "Academic Tone Check", desc: "Polish your writing", icon: FileText },
      { id: "lit-review", name: "Auto Literature Review", desc: "AI-generated review", icon: BookOpen },
      { id: "scholar-ai", name: "Scholar AI Assistant", desc: "Research writing helper", icon: Sparkles },
      { id: "abstract-generator", name: "Abstract Generator", desc: "Generate paper abstracts", icon: FileText },
    ],
  },
  {
    category: "Knowledge Base",
    tools: [
      { id: "highlight-sync", name: "Highlight Syncing", desc: "Sync your annotations", icon: BookOpen },
      { id: "citation-graph", name: "Citation Network", desc: "Visualize connections", icon: Brain },
      { id: "influence-explorer", name: "Influence Explorer", desc: "Map research impact", icon: Lightbulb },
      { id: "reading-list", name: "Smart Reading List", desc: "AI-curated papers", icon: BookOpen },
    ],
  },
];

const ResearchPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scholarMode, setScholarMode] = useState(false);
  const [viewMode, setViewMode] = useState<"papers" | "tools">("papers");
  const { addNote } = useScholarData();

  const { data: papers, isLoading } = useQuery({
    queryKey: ["papers", selectedCategory],
    queryFn: () => fetchPapers(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const filteredPapers = useMemo(() => {
    if (!papers) return [];
    return papers.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.authors && p.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (p.abstract && p.abstract.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [papers, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!papers) return { total: 0, categories: 0, avgCitations: 0 };
    const cats = new Set(papers.map(p => p.category));
    const avgCit = papers.length > 0 ? Math.round(papers.reduce((s, p) => s + (p.citations || 0), 0) / papers.length) : 0;
    return { total: papers.length, categories: cats.size, avgCitations: avgCit };
  }, [papers]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Research Archive</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground">Research & Scholar OS</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Access Nobel Prize publications, AI-powered research tools, and your personal knowledge base.
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 bg-card/50 px-4 py-2 rounded-xl border border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.total}</p>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Papers</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.categories}</p>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Fields</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.avgCitations}</p>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Avg Citations</p>
              </div>
            </div>

            {/* Scholar Mode */}
            <Button
              variant={scholarMode ? "default" : "outline"}
              className="rounded-xl gap-2"
              onClick={() => {
                setScholarMode(!scholarMode);
                if (!scholarMode) setViewMode("tools");
                toast(scholarMode ? "Scholar mode off" : "Scholar mode activated!", {
                  icon: <Sparkles className="h-4 w-4 text-amber-500" />,
                });
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Scholar OS</span>
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <Tabs value={viewMode} onValueChange={v => setViewMode(v as any)} className="mb-6">
          <TabsList className="rounded-xl">
            <TabsTrigger value="papers" className="rounded-lg text-xs gap-1.5">
              <FileText className="h-3 w-3" /> Papers
              <Badge variant="secondary" className="ml-1 h-4 text-[9px] rounded-full">{filteredPapers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tools" className="rounded-lg text-xs gap-1.5">
              <Brain className="h-3 w-3" /> Scholar Tools
              <Badge variant="secondary" className="ml-1 h-4 text-[9px] rounded-full">{SCHOLAR_TOOLS.reduce((s, c) => s + c.tools.length, 0)}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === "papers" && (
          <>
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="relative group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or topic..."
                  className="h-12 w-full rounded-2xl border border-border bg-card/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                    selectedCategory === "All"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  All Areas
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCategory(c.name)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                      selectedCategory === c.name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="opacity-70">{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Papers Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredPapers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {filteredPapers.map((p: any, i: number) => (
                    <PaperCard
                      key={p.id}
                      paper={{
                        id: p.id,
                        title: p.title,
                        author: Array.isArray(p.authors) ? p.authors.join(", ") : (p.author || "Unknown"),
                        category: p.category as NobelCategory,
                        year: p.year,
                        abstract: p.abstract || "",
                        pdfUrl: p.pdf_url,
                        doi: p.doi,
                        citations: p.citations,
                      } as any}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 rounded-3xl bg-muted/20 border border-dashed border-border">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">No papers found</h3>
                <p className="mt-2 text-muted-foreground text-sm">Try adjusting your search or category filter.</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* Scholar Tools View */}
        {viewMode === "tools" && (
          <div className="space-y-8">
            {SCHOLAR_TOOLS.map((group, gi) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.1 }}
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">{group.category}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {group.tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => navigate(`/scholar-os/${tool.id}`)}
                      className="group text-left p-4 rounded-xl border border-border bg-card/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <tool.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tool.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{tool.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={() => navigate("/nobel-ai")}>
                  <Sparkles className="h-3.5 w-3.5" /> Ask Nobel Oracle
                </Button>
                <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={() => navigate("/mentorship")}>
                  <Brain className="h-3.5 w-3.5" /> AI Mentorship
                </Button>
                <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={() => navigate("/scholar-dashboard")}>
                  <BarChart3 className="h-3.5 w-3.5" /> Scholar Dashboard
                </Button>
                <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={() => {
                  const data = { papers: filteredPapers?.slice(0, 20), exported: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "research_export.json";
                  a.click();
                  toast.success("Research data exported!");
                }}>
                  <Download className="h-3.5 w-3.5" /> Export Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ResearchPage;

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LectureCard from "@/frontend/components/cards/LectureCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchLectures } from "@/backend/services/lectures";
import { Loader2, Search, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const LecturesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: lectures, isLoading } = useQuery({
    queryKey: ["lectures", selectedCategory],
    queryFn: () => fetchLectures(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const filteredLectures = useMemo(() => {
    if (!lectures) return [];
    return lectures.filter(l =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.speaker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [lectures, searchQuery]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl font-bold text-foreground">Lecture Library</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Watch the prestigious Nobel Prize lectures, banquet speeches, and official presentations.
            </p>
          </motion.div>

          <div className="hidden md:flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {filteredLectures.length} Lectures Available
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by speaker, title, or keyword..."
              className="h-12 w-full rounded-2xl border border-border bg-card/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory("All");
                toast.info("Viewing all lectures");
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
                  toast.success(`Showing ${c.name} lectures`);
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
            <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">Streaming from the Vault...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            {filteredLectures.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredLectures.map((l: any, i: number) => (
                    <LectureCard
                      key={l.id}
                      lecture={{
                        id: l.id,
                        title: l.title,
                        speakerName: l.speaker_name,
                        category: l.category as NobelCategory,
                        year: l.year,
                        duration: l.duration,
                        views: l.views,
                        thumbnail: l.thumbnail || "",
                        description: l.description || ""
                      } as any}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-20 flex flex-col items-center text-center p-12 rounded-3xl bg-secondary/20 border border-border border-dashed">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground">No Lectures Found</h3>
                <p className="mt-2 text-muted-foreground">
                  We couldn't find any lectures matching your criteria in {selectedCategory}.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 font-bold uppercase tracking-widest"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Reset Selection
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default LecturesPage;


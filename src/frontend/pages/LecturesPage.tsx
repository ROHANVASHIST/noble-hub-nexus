import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LectureCard from "@/frontend/components/cards/LectureCard";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchLectures } from "@/backend/services/lectures";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const LecturesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");

  const { data: lectures, isLoading } = useQuery({
    queryKey: ["lectures", selectedCategory],
    queryFn: () => fetchLectures(selectedCategory === "All" ? undefined : selectedCategory),
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Lecture Library</h1>
          <p className="mt-2 text-muted-foreground">Watch Nobel Prize lectures, presentations, and educational content.</p>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory("All");
              toast.info("Viewing all lectures");
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setSelectedCategory(c.name);
                toast.success(`Showing ${c.name} lectures`);
              }}
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
            <p className="text-muted-foreground">Loading lectures from the archive...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lectures?.map((l: any, i: number) => (
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
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default LecturesPage;

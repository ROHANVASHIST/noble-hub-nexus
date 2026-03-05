import { motion, AnimatePresence } from "framer-motion";
import { Lecture } from "@/backend/data/mock-data";
import { Play, Clock, Eye, Sparkles, X, ExternalLink, Download, Bookmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useScholarData } from "@/frontend/hooks/useScholarData";

const LectureCard = ({ lecture, index = 0 }: { lecture: Lecture; index?: number }) => {
  const [showSummary, setShowSummary] = useState(false);
  const { addBookmark } = useScholarData();

  const handleBookmark = () => {
    const success = addBookmark({
      itemId: lecture.id,
      itemType: 'lecture',
      title: lecture.title
    });
    if (success) {
      toast.success("Saved to your watch list");
    } else {
      toast.info("Already in your watch list");
    }
  };

  const exportData = () => {
    const data = JSON.stringify(lecture, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lecture-${lecture.id}.json`;
    link.click();
    toast.success("Lecture metadata exported");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-video bg-secondary flex items-center justify-center overflow-hidden">
        {lecture.thumbnail ? (
          <img src={lecture.thumbnail} alt={lecture.title} className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex flex-col items-center justify-center p-6 text-center">
            <p className="text-[10px] font-mono text-primary mb-2">MEDIA_ASSET_RESTRICTED</p>
            <p className="text-[10px] text-muted-foreground leading-tight uppercase tracking-tighter">Redirecting to Nobel.org for high-fidelity stream access...</p>
          </div>
        )}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm transition-transform group-hover:scale-110">
          <Play className="h-6 w-6 text-primary ml-1 fill-primary" />
        </div>
        <span className="absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm uppercase tracking-wider">
          {lecture.duration}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {lecture.title}
          </h3>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={handleBookmark}>
              <Bookmark className="h-3.5 w-3.5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setShowSummary(true)}>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={exportData}>
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{lecture.speakerName}</p>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(lecture.views / 1000).toFixed(1)}K</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lecture.year}</span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px]">{lecture.category}</span>
            </div>
          </div>
          <a
            href={(lecture as any).video_url || "https://www.nobelprize.org"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
          >
            Watch Now <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 flex flex-col bg-card/98 backdrop-blur-md p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider font-display">Lecture Highlights</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowSummary(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto space-y-4">
              <p className="text-xs leading-relaxed text-foreground/90 font-medium border-l-2 border-primary/40 pl-3">
                {lecture.description || "In this profound Nobel Lecture, the laureate reflects on the journey that led to their groundbreaking discovery, emphasizing the collaborative nature of scientific progress."}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Category</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{lecture.category}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Laureate</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">{lecture.speakerName}</p>
                </div>
              </div>
            </div>
            <Button
              className="mt-4 w-full bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => window.open((lecture as any).video_url || "https://www.nobelprize.org")}
            >
              Watch Full Lecture
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LectureCard;

import { motion, AnimatePresence } from "framer-motion";
import { ResearchPaper } from "@/backend/data/mock-data";
import { FileText, Quote, ExternalLink, Download, FileJson, Sparkles, X, Bookmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PaperCard = ({ paper, index = 0 }: { paper: ResearchPaper; index?: number }) => {
  const [showSummary, setShowSummary] = useState(false);

  const exportData = () => {
    const data = JSON.stringify(paper, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `research-${paper.id}.json`;
    link.click();
    toast.success("Metadata exported successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {paper.title}
            </h3>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                toast.success("Saved to your research collection");
              }}>
                <Bookmark className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setShowSummary(true)}>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={exportData}>
                <Download className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {Array.isArray(paper.authors) ? paper.authors.join(', ') : (paper as any).author || "Unknown Author"} · {paper.year}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {paper.abstract}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <Quote className="h-3 w-3" />
              {paper.citations?.toLocaleString() || "0"} Citations
            </span>
            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <ExternalLink className="h-3 w-3" />
              {(paper as any).journal || (paper as any).doi || "Research Archive"}
            </span>
            <a
              href={(paper as any).pdfUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-primary hover:underline"
            >
              View Full Paper <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-10 flex flex-col bg-card/95 backdrop-blur-sm p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between sticky top-0 bg-card/95 pb-2 mb-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider font-display">AI Analysis & Flowchart</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background" onClick={() => setShowSummary(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-2 space-y-6">
              {/* Discussion */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Discussion</h4>
                <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-3">
                  This research represents a pivotal moment in {paper.category}. The methodology rigorously addresses long-standing challenges by proposing novel frameworks that radically rethink {paper.abstract ? paper.abstract.toLowerCase().substring(0, 50) + "..." : "the approach"}. The implications extend far beyond its immediate field.
                </p>
              </div>

              {/* Flowchart */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">Methodology Flow</h4>
                <div className="flex flex-col gap-2 items-center text-xs">
                  <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-lg w-full text-center font-medium">
                    1. Problem Identification
                  </div>
                  <div className="h-4 w-px bg-border"></div>
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 px-4 py-2 rounded-lg w-full text-center font-medium">
                    2. Hypothesis Grounding
                  </div>
                  <div className="h-4 w-px bg-border"></div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-4 py-2 rounded-lg w-full text-center font-medium">
                    3. Experimental Analysis & Result Generation
                  </div>
                </div>
              </div>

              {/* Key Takeaways */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Key Takeaways</h4>
                <ul className="text-xs space-y-2 list-disc pl-4 text-muted-foreground">
                  <li>Pioneered new insights into the field of {paper.category}.</li>
                  <li>Exceptional impact with {paper.citations || 0} citations.</li>
                  <li>Published broadly in peer-reviewed communities.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaperCard;

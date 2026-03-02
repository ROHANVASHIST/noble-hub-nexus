import { motion } from "framer-motion";
import { ResearchPaper } from "@/data/mock-data";
import { FileText, Quote, ExternalLink } from "lucide-react";

const PaperCard = ({ paper, index = 0 }: { paper: ResearchPaper; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    className="group rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {paper.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{paper.authors.join(', ')} · {paper.year}</p>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{paper.abstract}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Quote className="h-3 w-3" />{paper.citations.toLocaleString()} citations</span>
          <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />{paper.journal}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default PaperCard;

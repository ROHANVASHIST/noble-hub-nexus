import { motion } from "framer-motion";
import { Laureate } from "@/backend/data/mock-data";
import { Award } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Physics: 'bg-blue-500/10 text-blue-400',
  Chemistry: 'bg-emerald-500/10 text-emerald-400',
  Medicine: 'bg-rose-500/10 text-rose-400',
  Literature: 'bg-amber-500/10 text-amber-400',
  Peace: 'bg-sky-500/10 text-sky-400',
  Economics: 'bg-violet-500/10 text-violet-400',
};

import { Link } from "react-router-dom";

const LaureateCard = ({ laureate, index = 0 }: { laureate: Laureate; index?: number }) => (
  <Link to={`/laureates/${laureate.id}`} className="block">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {laureate.firstName} {laureate.lastName}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{laureate.nationality} · {laureate.year}</p>
          <div className="mt-2.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${CATEGORY_COLORS[laureate.category]}`}>
              {laureate.category}
            </span>
          </div>
          <p className="mt-4 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {laureate.motivation}
          </p>
        </div>
      </div>
    </motion.div>
  </Link>
);

export default LaureateCard;

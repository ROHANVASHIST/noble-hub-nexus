import { motion } from "framer-motion";
import { Laureate } from "@/backend/data/mock-data";
import { Award, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORY_COLORS: Record<string, string> = {
  Physics: 'bg-blue-500/10 text-blue-400',
  Chemistry: 'bg-emerald-500/10 text-emerald-400',
  Medicine: 'bg-rose-500/10 text-rose-400',
  Literature: 'bg-amber-500/10 text-amber-400',
  Peace: 'bg-sky-500/10 text-sky-400',
  Economics: 'bg-violet-500/10 text-violet-400',
};

interface LaureateCardProps {
  laureate: Laureate;
  index?: number;
  isCompareMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const LaureateCard = ({
  laureate,
  index = 0,
  isCompareMode = false,
  isSelected = false,
  onSelect
}: LaureateCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{
      delay: index * 0.05,
      type: "spring",
      stiffness: 260,
      damping: 20
    }}
    className="group relative"
  >
    {isCompareMode && (
      <div className="absolute right-3 top-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect?.(laureate.id)}
          className="h-6 w-6 rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
        />
      </div>
    )}

    <Link to={isCompareMode ? "#" : `/laureates/${laureate.id}`}
      onClick={(e) => {
        if (isCompareMode) {
          e.preventDefault();
          onSelect?.(laureate.id);
        }
      }}
      className={`block h-full transition-all duration-500 ${isSelected ? 'ring-2 ring-primary ring-offset-4 ring-offset-background rounded-xl' : ''}`}
    >
      <div className={`relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all h-full
        ${isSelected ? 'border-primary/50 shadow-lg shadow-primary/10' : 'hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5'}
      `}>
        {isSelected && (
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-amber-500 to-primary" />
        )}

        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-500
            ${isSelected ? 'bg-primary text-primary-foreground rotate-12 scale-110' : 'bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:rotate-12'}
          `}>
            {isSelected ? <CheckCircle2 className="h-6 w-6" /> : <Award className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-display text-base font-bold truncate transition-colors duration-300
              ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}
            `}>
              {laureate.firstName} {laureate.lastName}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{laureate.nationality} · {laureate.year}</p>
            <div className="mt-2.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter shadow-sm transition-all duration-500 ${CATEGORY_COLORS[laureate.category]} ${isSelected ? 'scale-105' : ''}`}>
                {laureate.category}
              </span>
            </div>
            <p className="mt-4 line-clamp-2 text-xs text-muted-foreground leading-relaxed transition-opacity duration-300 group-hover:opacity-100 opacity-80">
              {laureate.motivation}
            </p>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default LaureateCard;


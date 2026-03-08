import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Calendar, Globe, Award, BookOpen, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface SearchFilters {
  categories: string[];
  yearRange: [number, number];
  nationalities: string[];
  contentTypes: string[];
}

const CATEGORIES = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"];
const CONTENT_TYPES = [
  { key: "laureates", label: "Laureates", icon: Award },
  { key: "lectures", label: "Lectures", icon: BookOpen },
  { key: "papers", label: "Papers", icon: BookOpen },
];
const NATIONALITIES = ["American", "British", "German", "French", "Swedish", "Japanese", "Russian", "Swiss", "Indian", "Chinese"];

interface FacetedFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  resultCounts?: { laureates: number; lectures: number; papers: number };
  isVisible: boolean;
  onToggle: () => void;
}

export default function FacetedFilters({ filters, onChange, resultCounts, isVisible, onToggle }: FacetedFiltersProps) {
  const activeCount = filters.categories.length + filters.nationalities.length + filters.contentTypes.length + (filters.yearRange[0] !== 1901 || filters.yearRange[1] !== 2025 ? 1 : 0);

  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const clearAll = () => onChange({ categories: [], yearRange: [1901, 2025], nationalities: [], contentTypes: [] });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={isVisible ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          className="rounded-xl gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive rounded-xl gap-1">
            <X className="h-3 w-3" /> Clear all
          </Button>
        )}

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {filters.categories.map(c => (
            <Badge key={c} variant="secondary" className="rounded-full gap-1 text-[10px] cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, categories: toggle(filters.categories, c) })}>
              {c} <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {filters.nationalities.map(n => (
            <Badge key={n} variant="secondary" className="rounded-full gap-1 text-[10px] cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, nationalities: toggle(filters.nationalities, n) })}>
              {n} <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {(filters.yearRange[0] !== 1901 || filters.yearRange[1] !== 2025) && (
            <Badge variant="secondary" className="rounded-full gap-1 text-[10px] cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, yearRange: [1901, 2025] })}>
              {filters.yearRange[0]}–{filters.yearRange[1]} <X className="h-2.5 w-2.5" />
            </Badge>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm mb-8">
              {/* Content Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Filter className="h-3 w-3" /> Content Type
                </label>
                <div className="space-y-1.5">
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct.key}
                      onClick={() => onChange({ ...filters, contentTypes: toggle(filters.contentTypes, ct.key) })}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border",
                        filters.contentTypes.includes(ct.key)
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-card text-muted-foreground border-border hover:border-primary/20"
                      )}
                    >
                      <span className="flex items-center gap-2"><ct.icon className="h-3.5 w-3.5" /> {ct.label}</span>
                      {resultCounts && <span className="text-[10px] opacity-60">{resultCounts[ct.key as keyof typeof resultCounts]}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Award className="h-3 w-3" /> Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => onChange({ ...filters, categories: toggle(filters.categories, cat) })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border",
                        filters.categories.includes(cat)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Year: {filters.yearRange[0]} — {filters.yearRange[1]}
                </label>
                <div className="px-1 pt-2">
                  <Slider
                    min={1901}
                    max={2025}
                    step={1}
                    value={filters.yearRange}
                    onValueChange={(val) => onChange({ ...filters, yearRange: val as [number, number] })}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>1901</span>
                  <span>2025</span>
                </div>
              </div>

              {/* Nationalities */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Nationality
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {NATIONALITIES.map(nat => (
                    <button
                      key={nat}
                      onClick={() => onChange({ ...filters, nationalities: toggle(filters.nationalities, nat) })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold transition-all border",
                        filters.nationalities.includes(nat)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/20"
                      )}
                    >
                      {nat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

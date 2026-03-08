import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, TrendingUp, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  recentSearches: string[];
  onClearRecent: () => void;
  onRemoveRecent: (term: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const TRENDING = ["Quantum Physics", "Marie Curie", "Peace 2024", "CRISPR", "Climate Change", "mRNA Vaccine"];

export default function SearchAutocomplete({
  value,
  onChange,
  suggestions,
  recentSearches,
  onClearRecent,
  onRemoveRecent,
  isLoading,
  placeholder = "Search laureates, papers, lectures..."
}: SearchAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showDropdown = isFocused && (value.length > 0 ? suggestions.length > 0 : recentSearches.length > 0 || true);

  const allItems = value.length > 0
    ? suggestions.slice(0, 8)
    : [...recentSearches.slice(0, 5).map(s => ({ type: "recent" as const, text: s })), ...TRENDING.filter(t => !recentSearches.includes(t)).slice(0, 4).map(s => ({ type: "trending" as const, text: s }))];

  const flatItems = value.length > 0 ? suggestions.slice(0, 8) : allItems.map(i => (typeof i === "string" ? i : i.text));

  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      onChange(flatItems[selectedIndex]);
      setIsFocused(false);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-amber-500/40 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500" />
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-16 w-full rounded-2xl border border-border bg-card/80 backdrop-blur-md pl-14 pr-14 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            autoFocus
          />
          {value && (
            <button onClick={() => onChange("")} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {isLoading && !value && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && isFocused && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden"
          >
            {value.length > 0 ? (
              <div className="p-2">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suggestions</p>
                {suggestions.slice(0, 8).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { onChange(s); setIsFocused(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all",
                      selectedIndex === i ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span dangerouslySetInnerHTML={{
                      __html: s.replace(new RegExp(`(${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<strong class="text-primary">$1</strong>')
                    }} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent Searches</p>
                      <button onClick={onClearRecent} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">Clear</button>
                    </div>
                    {recentSearches.slice(0, 5).map((s, i) => (
                      <div key={s} className="flex items-center group/item">
                        <button
                          onClick={() => { onChange(s); setIsFocused(false); }}
                          className={cn(
                            "flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all",
                            selectedIndex === i ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                          )}
                        >
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {s}
                        </button>
                        <button onClick={() => onRemoveRecent(s)} className="p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-muted transition-all">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                <div className="px-3 py-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Trending
                  </p>
                </div>
                {TRENDING.slice(0, 4).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { onChange(s); setIsFocused(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all",
                      selectedIndex === (recentSearches.length + i) ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

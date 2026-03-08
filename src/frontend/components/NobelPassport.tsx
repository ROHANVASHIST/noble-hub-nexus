import { useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Award, Trophy, Star, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCertificateHTML, openPrintWindow } from "@/lib/pdf-utils";

interface PassportProps {
  viewedLaureates: Array<{ id: string; category: string; nationality: string }>;
  userName: string;
}

const CATEGORY_TARGETS: Record<string, number> = {
  Physics: 225, Chemistry: 194, Medicine: 227, Literature: 120, Peace: 112, Economics: 93,
};

const MILESTONES = [
  { count: 10, label: "Curious Explorer", emoji: "🔍" },
  { count: 25, label: "Knowledge Seeker", emoji: "📚" },
  { count: 50, label: "Research Devotee", emoji: "🎓" },
  { count: 100, label: "Nobel Scholar", emoji: "🏅" },
  { count: 200, label: "Grand Master", emoji: "👑" },
];

const NobelPassport = ({ viewedLaureates, userName }: PassportProps) => {
  const stats = useMemo(() => {
    const countries = new Set(viewedLaureates.map(l => l.nationality));
    const categories: Record<string, number> = {};
    viewedLaureates.forEach(l => {
      categories[l.category] = (categories[l.category] || 0) + 1;
    });
    return { countries: countries.size, totalViewed: viewedLaureates.length, categories };
  }, [viewedLaureates]);

  const currentMilestone = MILESTONES.filter(m => stats.totalViewed >= m.count).pop();
  const nextMilestone = MILESTONES.find(m => stats.totalViewed < m.count);

  const handleCertificate = (category: string) => {
    const count = stats.categories[category] || 0;
    const html = generateCertificateHTML({
      userName,
      category,
      completedCount: count,
      totalCount: CATEGORY_TARGETS[category] || 100,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
    openPrintWindow(html);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> Nobel Passport
        </h3>
        <span className="text-xs text-muted-foreground">{stats.totalViewed} laureates explored</span>
      </div>

      {/* Current Badge */}
      {currentMilestone && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
          <div className="text-3xl mb-2">{currentMilestone.emoji}</div>
          <div className="text-sm font-bold text-primary">{currentMilestone.label}</div>
          {nextMilestone && (
            <div className="mt-2">
              <div className="text-[10px] text-muted-foreground">{nextMilestone.count - stats.totalViewed} more to reach {nextMilestone.label}</div>
              <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden">
                <motion.div className="h-full bg-primary" initial={{ width: 0 }}
                  animate={{ width: `${((stats.totalViewed - (currentMilestone?.count || 0)) / (nextMilestone.count - (currentMilestone?.count || 0))) * 100}%` }} />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Countries stamp */}
      <div className="rounded-2xl border border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Countries Explored</span>
        </div>
        <div className="text-2xl font-display font-bold text-primary">{stats.countries}</div>
        <div className="text-[10px] text-muted-foreground">out of 81 Nobel nations</div>
      </div>

      {/* Category Progress */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Award className="h-3 w-3" /> Category Progress
        </span>
        {Object.entries(CATEGORY_TARGETS).map(([cat, total]) => {
          const count = stats.categories[cat] || 0;
          const pct = Math.min(100, Math.round((count / total) * 100));
          return (
            <div key={cat} className="rounded-xl border border-border bg-card/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{count}/{total}</span>
                  {pct >= 50 && (
                    <button onClick={() => handleCertificate(cat)} className="text-[10px] text-primary hover:underline font-bold">
                      Certificate
                    </button>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NobelPassport;

import { motion } from "framer-motion";
import { Award, BookOpen, Brain, Flame, MessageSquare, Search, Star, Target, Trophy, Zap } from "lucide-react";

interface BadgeDef {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  condition: (stats: UserStats) => boolean;
  tier: "bronze" | "silver" | "gold";
}

interface UserStats {
  notes: number;
  projects: number;
  breakthroughs: number;
  bookmarks: number;
  mentorChats: number;
}

const TIER_STYLES = {
  bronze: "border-amber-700/30 bg-amber-900/10 text-amber-600",
  silver: "border-slate-400/30 bg-slate-500/10 text-slate-400",
  gold: "border-primary/30 bg-primary/10 text-primary",
};

const TIER_GLOW = {
  bronze: "",
  silver: "shadow-slate-400/5",
  gold: "shadow-primary/10 shadow-lg",
};

const BADGES: BadgeDef[] = [
  { id: "first-note", label: "First Entry", description: "Create your first lab note", icon: <BookOpen className="h-5 w-5" />, condition: s => s.notes >= 1, tier: "bronze" },
  { id: "researcher", label: "Active Researcher", description: "Create 5+ lab notes", icon: <Brain className="h-5 w-5" />, condition: s => s.notes >= 5, tier: "silver" },
  { id: "prolific", label: "Prolific Scholar", description: "Create 20+ lab notes", icon: <Star className="h-5 w-5" />, condition: s => s.notes >= 20, tier: "gold" },
  { id: "first-project", label: "Project Pioneer", description: "Start your first research project", icon: <Target className="h-5 w-5" />, condition: s => s.projects >= 1, tier: "bronze" },
  { id: "multi-project", label: "Multi-Track Mind", description: "Have 3+ research projects", icon: <Zap className="h-5 w-5" />, condition: s => s.projects >= 3, tier: "silver" },
  { id: "eureka", label: "Eureka!", description: "Generate your first AI breakthrough", icon: <Flame className="h-5 w-5" />, condition: s => s.breakthroughs >= 1, tier: "bronze" },
  { id: "visionary", label: "Research Visionary", description: "Generate 5+ breakthroughs", icon: <Trophy className="h-5 w-5" />, condition: s => s.breakthroughs >= 5, tier: "gold" },
  { id: "curator", label: "Knowledge Curator", description: "Bookmark 3+ items", icon: <Search className="h-5 w-5" />, condition: s => s.bookmarks >= 3, tier: "bronze" },
  { id: "collector", label: "Grand Collector", description: "Bookmark 10+ items", icon: <Award className="h-5 w-5" />, condition: s => s.bookmarks >= 10, tier: "silver" },
  { id: "mentee", label: "Seeking Wisdom", description: "Have a mentor conversation", icon: <MessageSquare className="h-5 w-5" />, condition: s => s.mentorChats >= 1, tier: "bronze" },
];

const AchievementBadges = ({ stats }: { stats: UserStats }) => {
  const earned = BADGES.filter(b => b.condition(stats));
  const locked = BADGES.filter(b => !b.condition(stats));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" /> Achievements
        </h3>
        <span className="text-xs text-muted-foreground font-bold">{earned.length}/{BADGES.length} unlocked</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${(earned.length / BADGES.length) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} />
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {earned.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-4 ${TIER_STYLES[badge.tier]} ${TIER_GLOW[badge.tier]}`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">{badge.icon}</div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{badge.label}</div>
                  <div className="text-[10px] opacity-70 truncate">{badge.description}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {locked.map(badge => (
            <div key={badge.id} className="rounded-2xl border border-border/30 bg-card/20 p-4 opacity-40">
              <div className="flex items-center gap-3">
                <div className="shrink-0 grayscale">{badge.icon}</div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-muted-foreground truncate">{badge.label}</div>
                  <div className="text-[10px] text-muted-foreground/60 truncate">{badge.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Award, BookOpen, Video, Globe, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import LectureCard from "@/frontend/components/cards/LectureCard";
import StatCard from "@/frontend/components/cards/StatCard";
import { CATEGORIES, ANALYTICS_DATA, NobelCategory } from "@/backend/data/mock-data";
import { fetchLaureates } from "@/backend/services/laureates";
import { fetchLectures } from "@/backend/services/lectures";
import heroBg from "@/frontend/assets/hero-bg.jpg";

const Index = () => {
  const { data: laureates, isLoading: loadingLaureates } = useQuery({
    queryKey: ["featured-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const { data: lectures, isLoading: loadingLectures } = useQuery({
    queryKey: ["featured-lectures"],
    queryFn: () => fetchLectures(),
  });

  const stats = [
    { icon: Award, label: "Nobel Laureates", value: 971 },
    { icon: BookOpen, label: "Research Papers", value: 10500 },
    { icon: Video, label: "Lectures", value: 1243 },
    { icon: Globe, label: "Countries", value: 81 },
  ];

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative mx-auto px-4 pb-20 pt-24 md:pt-32 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-primary tracking-wide uppercase">Research Intelligence Active</span>
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl leading-[1.1]">
                  Master the <span className="text-gradient-gold">Nobel Legacy</span>
                </h1>
                <p className="mt-6 text-base text-muted-foreground md:text-lg max-w-xl leading-relaxed">
                  Access deep-dive summaries, exportable research data, and over a century of academic excellence in one unified platform.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
                  <Link
                    to="/search"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-primary/30"
                  >
                    <Search className="h-4 w-4" /> Smart Search
                  </Link>
                  <Link
                    to="/laureates"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm px-8 text-sm font-medium text-foreground transition-all hover:bg-card"
                  >
                    Browse All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl shadow-2xl relative"
              >
                <div className="absolute -top-3 -right-3 h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Daily Research Digest</h3>
                <div className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Featured Insight</p>
                    <p className="text-sm font-medium text-foreground/90">The discovery of chemical dynamics by van 't Hoff continues to underpin modern thermodynamics.</p>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Laureates</p>
                      <p className="text-lg font-display font-bold text-primary">971</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Archived Lectures</p>
                      <p className="text-lg font-display font-bold text-primary">1,243</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-tighter h-9" onClick={() => toast.success("Summary generated for your feed")}>
                    Generate Weekly Report
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Prize Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`rounded-xl border border-border/50 bg-gradient-to-br ${cat.color} p-4 text-center transition-all hover:border-primary/30 cursor-pointer`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <p className="mt-2 font-display text-sm font-semibold text-foreground">{cat.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{cat.count} laureates</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Laureates */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Laureates</h2>
          <Link to="/laureates" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loadingLaureates ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {laureates?.slice(0, 4).map((l, i) => (
              <LaureateCard
                key={l.id}
                laureate={{
                  id: l.id,
                  firstName: l.first_name,
                  lastName: l.last_name,
                  birthYear: l.birth_year,
                  deathYear: l.death_year || undefined,
                  nationality: l.nationality,
                  category: l.category as NobelCategory,
                  year: l.year,
                  motivation: l.motivation,
                  institution: l.institution,
                  photo: l.photo || "",
                  biography: l.biography || ""
                } as any}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Lectures */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Lectures</h2>
          <Link to="/lectures" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loadingLectures ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {lectures?.slice(0, 3).map((l, i) => (
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
      </section>
    </PageLayout>
  );
};

export default Index;

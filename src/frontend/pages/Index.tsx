import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Award, BookOpen, Video, BarChart3, Users, Globe } from "lucide-react";
import PageLayout from "@/frontend/components/layout/PageLayout";
import LaureateCard from "@/frontend/components/cards/LaureateCard";
import LectureCard from "@/frontend/components/cards/LectureCard";
import StatCard from "@/frontend/components/cards/StatCard";
import { CATEGORIES, LAUREATES, LECTURES, ANALYTICS_DATA } from "@/backend/data/mock-data";
import heroBg from "@/frontend/assets/hero-bg.jpg";

const stats = [
  { icon: Award, label: "Nobel Laureates", value: ANALYTICS_DATA.stats.totalLaureates },
  { icon: BookOpen, label: "Research Papers", value: ANALYTICS_DATA.stats.totalPapers },
  { icon: Video, label: "Lectures", value: ANALYTICS_DATA.stats.totalLectures },
  { icon: Globe, label: "Countries", value: ANALYTICS_DATA.stats.countries },
];

const Index = () => {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative mx-auto px-4 pb-20 pt-24 md:pt-32 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">125+ Years of Nobel Excellence</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Discover the World of{" "}
              <span className="text-gradient-gold">Nobel Prizes</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg max-w-xl mx-auto">
              Explore laureates, lectures, research papers, and insights from over a century of groundbreaking achievements.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/search"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                <Search className="h-4 w-4" /> Search Nobel Hub
              </Link>
              <Link
                to="/laureates"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-all hover:border-primary/30"
              >
                Browse Laureates <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-4">
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
          <h2 className="font-display text-2xl font-bold text-foreground">Featured Laureates</h2>
          <Link to="/laureates" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {LAUREATES.slice(0, 4).map((l, i) => (
            <LaureateCard key={l.id} laureate={l} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Lectures */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Popular Lectures</h2>
          <Link to="/lectures" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {LECTURES.slice(0, 3).map((l, i) => (
            <LectureCard key={l.id} lecture={l} index={i} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;

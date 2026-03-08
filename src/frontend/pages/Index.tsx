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
import NobelOfTheDay from "@/frontend/components/NobelOfTheDay";
import { CATEGORIES, NobelCategory } from "@/backend/data/mock-data";
import { fetchLaureates } from "@/backend/services/laureates";
import { fetchLectures } from "@/backend/services/lectures";
import heroBg from "@/frontend/assets/hero-bg.jpg";
import { useState } from "react";

const Index = () => {
  const { data: laureates, isLoading: loadingLaureates } = useQuery({
    queryKey: ["featured-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const { data: lectures, isLoading: loadingLectures } = useQuery({
    queryKey: ["featured-lectures"],
    queryFn: () => fetchLectures(),
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 20,
      y: (clientY / innerHeight - 0.5) * 20,
    });
  };

  const stats = [
    { icon: Award, label: "Nobel Laureates", value: 971 },
    { icon: BookOpen, label: "Research Papers", value: 10500 },
    { icon: Video, label: "Lectures", value: 1243 },
    { icon: Globe, label: "Countries", value: 81 },
  ];


  return (
    <PageLayout>
      {/* Hero */}
      <section
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden min-h-[80vh] flex items-center"
      >
        <div className="absolute inset-0">
          <motion.div
            style={{ x: mousePos.x, y: mousePos.y }}
            className="h-full w-full"
          >
            <img src={heroBg} alt="" className="h-full w-full object-cover opacity-20 scale-110" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        <div className="container relative mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-5xl"
          >
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  <span className="text-xs font-black text-primary tracking-[0.2em] uppercase">Universal Archive Node</span>
                </motion.div>
                <h1 className="font-display text-5xl font-bold tracking-tight text-foreground md:text-8xl leading-[0.9]">
                  Unlocking Human <br />
                  <span className="text-gradient-gold">Potential</span>
                </h1>
                <p className="mt-8 text-lg text-muted-foreground md:text-xl max-w-xl leading-relaxed font-light">
                  Navigate a century of groundbreaking discoveries with our high-fidelity intelligence platform.
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
                  <Link
                    to="/search"
                    className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-2xl bg-primary px-10 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-amber-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Search className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">Launch Discover</span>
                  </Link>
                  <Link
                    to="/laureates"
                    className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-10 text-sm font-bold text-foreground transition-all hover:bg-white/10 hover:border-primary/30"
                  >
                    Archive Directory <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-card/30 p-8 backdrop-blur-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] relative group"
              >
                <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-bounce duration-[3000ms]">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Archival Intelligence</h3>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Latest Synchronization</p>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                      "The transition of state for topological phases of matter observed in 2016 remains a foundational pillar for quantum computing."
                    </p>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/5 p-4 border border-white/5 group-hover:border-primary/20 transition-colors">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active nodes</p>
                      <p className="text-2xl font-display font-black text-primary mt-1 text-gradient-gold">971</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 border border-white/5 group-hover:border-primary/20 transition-colors">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Peers</p>
                      <p className="text-2xl font-display font-black text-primary mt-1 text-gradient-gold">81</p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                    onClick={() => toast.success("Weekly summary initialized")}
                  >
                    Access Global Report
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections with Scroll Reveal */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 -mt-12 mb-24"
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-24 border-t border-white/5"
      >
        <div className="text-center mb-16">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Classifications</h4>
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">Universal Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toast.info(`Initializing bridge for ${cat.name}...`)}
              className={`group relative rounded-[2rem] border border-white/5 bg-gradient-to-br ${cat.color} p-6 text-center transition-all hover:scale-105 active:scale-95 cursor-pointer hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5`}
            >
              <div className="absolute inset-0 rounded-[2rem] bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl block relative z-10">{cat.icon}</span>
              <p className="mt-4 font-display text-base font-bold text-foreground relative z-10">{cat.name}</p>
              <p className="mt-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest relative z-10 opacity-60">
                {cat.count} Archives
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-24 bg-card/20 rounded-[4rem] border border-white/5"
      >
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Directory</h4>
            <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">Featured Laureates</h2>
          </div>
          <Link to="/laureates">
            <Button variant="ghost" className="gap-2 font-bold uppercase text-[10px] tracking-widest hover:text-primary">
              Explore Full Directory <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loadingLaureates ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {laureates?.slice(0, 4).map((l, i) => (
              <LaureateCard
                key={l.id}
                laureate={{
                  ...l,
                  firstName: l.first_name,
                  lastName: l.last_name,
                  birthYear: l.birth_year,
                  deathYear: l.death_year || undefined,
                  category: l.category as NobelCategory,
                } as any}
                index={i}
              />
            ))}
          </div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-32"
      >
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Screening Room</h4>
            <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">Curated Lectures</h2>
          </div>
          <Link to="/lectures">
            <Button variant="ghost" className="gap-2 font-bold uppercase text-[10px] tracking-widest hover:text-primary">
              Access Full Library <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loadingLectures ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lectures?.slice(0, 3).map((l, i) => (
              <LectureCard
                key={l.id}
                lecture={{
                  ...l,
                  speakerName: l.speaker_name,
                  category: l.category as NobelCategory,
                } as any}
                index={i}
              />
            ))}
          </div>
        )}
      </motion.section>
    </PageLayout>
  );
};

export default Index;

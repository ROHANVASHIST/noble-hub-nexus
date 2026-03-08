import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Clock, ChevronLeft, ChevronRight, Sparkles, Award, BookOpen, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const CATEGORY_COLORS: Record<string, string> = {
  Physics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Chemistry: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Medicine: "bg-red-500/20 text-red-400 border-red-500/30",
  Literature: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Peace: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Economics: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const HISTORICAL_CONTEXT: Record<number, string> = {
  1901: "The first Nobel Prizes are awarded. The world enters the 20th century.",
  1905: "Einstein publishes his theory of special relativity.",
  1914: "World War I begins. Nobel Peace Prize suspended until 1917.",
  1918: "End of World War I. The Spanish flu pandemic ravages the globe.",
  1928: "Alexander Fleming discovers penicillin.",
  1939: "World War II begins. Nobel Prizes suspended 1940-1942.",
  1945: "Atomic bombs dropped on Japan. End of WWII. United Nations founded.",
  1953: "Watson and Crick discover DNA's double helix structure.",
  1964: "Martin Luther King Jr. receives the Nobel Peace Prize.",
  1969: "The Nobel Memorial Prize in Economics is established.",
  1979: "Mother Teresa receives the Nobel Peace Prize.",
  1993: "Nelson Mandela and F.W. de Klerk share the Peace Prize.",
  2003: "Human Genome Project completed.",
  2012: "Discovery of the Higgs boson at CERN.",
  2020: "COVID-19 pandemic. CRISPR gene editing wins Chemistry prize.",
};

const getContextForYear = (year: number): string => {
  const exact = HISTORICAL_CONTEXT[year];
  if (exact) return exact;
  const decade = Math.floor(year / 10) * 10;
  const decadeContexts: Record<number, string> = {
    1900: "The dawn of modern science and the Nobel Prize tradition.",
    1910: "A turbulent decade shaped by the Great War.",
    1920: "The Roaring Twenties and the rise of quantum mechanics.",
    1930: "The Great Depression and advances in nuclear physics.",
    1940: "World War II reshapes global science and politics.",
    1950: "The Cold War era drives scientific competition.",
    1960: "Space exploration and civil rights movements.",
    1970: "Environmental awareness and molecular biology breakthroughs.",
    1980: "The personal computer revolution and genetic engineering.",
    1990: "The internet age and the end of the Cold War.",
    2000: "The genomics revolution and the war on terror.",
    2010: "AI breakthroughs and the era of big data.",
    2020: "Pandemic science and mRNA vaccine technology.",
  };
  return decadeContexts[decade] || "A year of remarkable scientific progress.";
};

const TimeMachinePage = () => {
  const [selectedYear, setSelectedYear] = useState(2020);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: allLaureates = [] } = useQuery({
    queryKey: ["time-machine-laureates"],
    queryFn: async () => {
      const { data } = await supabase.from("laureates").select("*").order("year");
      return data || [];
    },
  });

  const yearLaureates = useMemo(
    () => allLaureates.filter(l => l.year === selectedYear),
    [allLaureates, selectedYear]
  );

  const yearRange = useMemo(() => {
    if (!allLaureates.length) return { min: 1901, max: 2025 };
    const years = allLaureates.map(l => l.year);
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [allLaureates]);

  // Decade stats
  const decadeStats = useMemo(() => {
    const decade = Math.floor(selectedYear / 10) * 10;
    const inDecade = allLaureates.filter(l => l.year >= decade && l.year < decade + 10);
    const categories = new Map<string, number>();
    const countries = new Map<string, number>();
    inDecade.forEach(l => {
      categories.set(l.category, (categories.get(l.category) || 0) + 1);
      countries.set(l.nationality, (countries.get(l.nationality) || 0) + 1);
    });
    return {
      total: inDecade.length,
      topCategory: [...categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      topCountry: [...countries.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      uniqueCountries: countries.size,
    };
  }, [allLaureates, selectedYear]);

  // Auto-play
  const handlePlay = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    setIsPlaying(true);
    const interval = setInterval(() => {
      setSelectedYear(prev => {
        if (prev >= yearRange.max) { setIsPlaying(false); clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> Time Machine
            </h1>
            <p className="text-sm text-muted-foreground">Travel through 125 years of Nobel history</p>
          </div>
        </div>

        {/* Year Selector */}
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedYear(y => Math.max(yearRange.min, y - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Slider
                  value={[selectedYear]}
                  onValueChange={v => setSelectedYear(v[0])}
                  min={yearRange.min}
                  max={yearRange.max}
                  step={1}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedYear(y => Math.min(yearRange.max, y + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.span
                  key={selectedYear}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-black text-primary tabular-nums"
                >
                  {selectedYear}
                </motion.span>
                <Badge variant="outline" className="text-xs">{yearLaureates.length} laureate{yearLaureates.length !== 1 ? "s" : ""}</Badge>
              </div>
              <Button variant={isPlaying ? "destructive" : "default"} size="sm" onClick={handlePlay} className="text-xs">
                {isPlaying ? "⏸ Pause" : "▶ Play Timeline"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historical Context */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold">Historical Context</h3>
                  <p className="text-sm text-muted-foreground">{getContextForYear(selectedYear)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Laureates */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Nobel Laureates of {selectedYear}
            </h2>
            <AnimatePresence mode="wait">
              <motion.div key={selectedYear} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {yearLaureates.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">No Nobel Prizes were awarded in {selectedYear}.</p>
                    </CardContent>
                  </Card>
                ) : (
                  yearLaureates.map((l, i) => (
                    <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">{l.first_name} {l.last_name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{l.motivation}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge className={`text-[10px] ${CATEGORY_COLORS[l.category] || ""}`}>{l.category}</Badge>
                                {l.institution && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" />{l.institution}</span>}
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{l.nationality}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Decade Summary */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              {Math.floor(selectedYear / 10) * 10}s Decade
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                {[
                  { label: "Total Laureates", value: decadeStats.total },
                  { label: "Top Field", value: decadeStats.topCategory },
                  { label: "Top Country", value: decadeStats.topCountry },
                  { label: "Countries", value: decadeStats.uniqueCountries },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-semibold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mini timeline */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">QUICK JUMP</h3>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: Math.floor((yearRange.max - yearRange.min) / 10) + 1 }, (_, i) => yearRange.min + i * 10).map(decade => (
                    <Button
                      key={decade}
                      variant={Math.floor(selectedYear / 10) * 10 === decade ? "default" : "outline"}
                      size="sm"
                      className="text-[10px] h-6 px-2"
                      onClick={() => setSelectedYear(decade)}
                    >
                      {decade}s
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default TimeMachinePage;

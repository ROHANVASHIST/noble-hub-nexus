import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Zap, TrendingUp, Award, Globe, BookOpen, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

// Simulate citation growth based on year distance & category
const simulateCitationGrowth = (yearAwarded: number, category: string) => {
  const currentYear = 2025;
  const yearsElapsed = currentYear - yearAwarded;
  const categoryMultiplier: Record<string, number> = {
    Physics: 1.3, Chemistry: 1.2, Medicine: 1.4, Literature: 0.6, Peace: 0.5, Economics: 1.0,
  };
  const mult = categoryMultiplier[category] || 1;
  const data = [];
  let citations = 0;

  for (let y = yearAwarded; y <= currentYear; y++) {
    const age = y - yearAwarded;
    // Logistic growth curve with some randomness
    const growth = mult * 50 * Math.exp(-0.05 * age) * (1 + 0.3 * Math.sin(age * 0.5));
    citations += Math.max(0, Math.round(growth + Math.random() * 10));
    data.push({ year: y, citations, newCitations: Math.round(growth) });
  }
  return { data, totalCitations: citations, peakYear: data.reduce((a, b) => b.newCitations > a.newCitations ? b : a).year };
};

const simulateFieldImpact = (category: string) => {
  const fields = ["Academic Papers", "Patents", "Textbooks", "Public Policy", "Industry R&D", "Education"];
  return fields.map(f => ({
    field: f,
    impact: Math.round(30 + Math.random() * 70),
  }));
};

const ImpactSimulatorPage = () => {
  const [selectedLaureateId, setSelectedLaureateId] = useState<string>("");

  const { data: laureates = [] } = useQuery({
    queryKey: ["impact-laureates"],
    queryFn: async () => {
      const { data } = await supabase.from("laureates").select("id, first_name, last_name, category, year, motivation, nationality, institution").order("year", { ascending: false });
      return data || [];
    },
  });

  const selectedLaureate = useMemo(
    () => laureates.find(l => l.id === selectedLaureateId),
    [laureates, selectedLaureateId]
  );

  const simulation = useMemo(() => {
    if (!selectedLaureate) return null;
    const citationData = simulateCitationGrowth(selectedLaureate.year, selectedLaureate.category);
    const fieldImpact = simulateFieldImpact(selectedLaureate.category);
    const yearsElapsed = 2025 - selectedLaureate.year;

    // Ripple generations
    const ripples = [
      { gen: "1st Generation", desc: "Direct citations and immediate follow-up research", impact: Math.min(100, 40 + yearsElapsed * 2), count: Math.round(citationData.totalCitations * 0.4) },
      { gen: "2nd Generation", desc: "New fields and methodologies inspired", impact: Math.min(100, 20 + yearsElapsed * 1.5), count: Math.round(citationData.totalCitations * 0.3) },
      { gen: "3rd Generation", desc: "Industrial applications and societal changes", impact: Math.min(100, 10 + yearsElapsed), count: Math.round(citationData.totalCitations * 0.2) },
      { gen: "4th Generation", desc: "Textbooks, education, and cultural influence", impact: Math.min(100, 5 + yearsElapsed * 0.5), count: Math.round(citationData.totalCitations * 0.1) },
    ];

    return { ...citationData, fieldImpact, ripples, yearsElapsed };
  }, [selectedLaureate]);

  // Category breakdown for comparison
  const categoryComparison = useMemo(() => {
    const cats = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"];
    return cats.map(c => {
      const count = laureates.filter(l => l.category === c).length;
      return { category: c, count, avgImpact: Math.round(40 + Math.random() * 40) };
    });
  }, [laureates]);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" /> Research Impact Simulator
            </h1>
            <p className="text-sm text-muted-foreground">Visualize how Nobel discoveries ripple through science and society</p>
          </div>
        </div>

        {/* Laureate selector */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <Select value={selectedLaureateId} onValueChange={setSelectedLaureateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a laureate to simulate their research impact..." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {laureates.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.first_name} {l.last_name} — {l.category} ({l.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedLaureate && simulation && (
          <AnimatePresence mode="wait">
            <motion.div key={selectedLaureateId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold">{selectedLaureate.first_name} {selectedLaureate.last_name}</h2>
                    <p className="text-xs text-muted-foreground line-clamp-2">{selectedLaureate.motivation}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{selectedLaureate.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{selectedLaureate.year}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{selectedLaureate.nationality}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-primary">{simulation.totalCitations.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">Simulated Citations</div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Years of Impact", value: simulation.yearsElapsed, icon: TrendingUp },
                  { label: "Peak Citation Year", value: simulation.peakYear, icon: Sparkles },
                  { label: "Ripple Reach", value: `${simulation.ripples.reduce((a, r) => a + r.count, 0).toLocaleString()}`, icon: Globe },
                ].map(s => (
                  <Card key={s.label} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <div className="text-lg font-bold">{s.value}</div>
                        <div className="text-[10px] text-muted-foreground">{s.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Citation growth chart */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Citation Growth Over Time</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={simulation.data}>
                        <defs>
                          <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="citations" stroke="hsl(var(--primary))" fill="url(#citGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Field Impact Radar */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Cross-Domain Impact</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={simulation.fieldImpact}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="field" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                        <Radar dataKey="impact" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Ripple Effect */}
              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Ripple Effect Generations</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {simulation.ripples.map((r, i) => (
                      <motion.div key={r.gen} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                        <div className="relative p-3 rounded-lg border border-border/50 bg-muted/30">
                          <div className="text-xs font-semibold text-primary">{r.gen}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{r.desc}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-bold">{r.count.toLocaleString()}</span>
                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${r.impact}%` }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category comparison */}
              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Category Impact Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryComparison}>
                      <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="avgImpact" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {!selectedLaureate && (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-muted-foreground">Select a Laureate</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Choose a Nobel laureate above to simulate the ripple effect of their discovery</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageLayout>
  );
};

export default ImpactSimulatorPage;

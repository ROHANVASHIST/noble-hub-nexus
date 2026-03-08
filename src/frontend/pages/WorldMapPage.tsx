import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { fetchLaureates } from "@/backend/services/laureates";
import { Globe, Award, Users, TrendingUp, Loader2, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHART_COLORS = [
  "hsl(42, 65%, 58%)", "hsl(220, 60%, 55%)", "hsl(155, 55%, 45%)", "hsl(350, 55%, 55%)",
  "hsl(270, 50%, 55%)", "hsl(200, 60%, 55%)", "hsl(42, 70%, 72%)", "hsl(155, 65%, 35%)",
];

const WorldMapPage = () => {
  const { data: laureates = [], isLoading } = useQuery({
    queryKey: ["world-map-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countryData = useMemo(() => {
    const map: Record<string, any[]> = {};
    laureates.forEach(l => {
      const nat = l.nationality || "Unknown";
      if (!map[nat]) map[nat] = [];
      map[nat].push(l);
    });
    return Object.entries(map)
      .map(([country, list]) => ({
        country,
        count: list.length,
        laureates: list,
        categories: [...new Set(list.map(l => l.category))],
      }))
      .sort((a, b) => b.count - a.count);
  }, [laureates]);

  const topCountries = countryData.slice(0, 20);
  const selectedData = countryData.find(c => c.country === selectedCountry);

  const totalCountries = countryData.length;
  const topCountry = countryData[0];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">World Map of Nobel Laureates</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Explore Nobel Prize distribution across {totalCountries} countries and territories.</p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Countries", value: totalCountries, icon: Globe },
                  { label: "Total Laureates", value: laureates.length, icon: Award },
                  { label: "Top Country", value: topCountry?.country || "-", icon: TrendingUp },
                  { label: "Top Count", value: topCountry?.count || 0, icon: Users },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-2xl border border-border bg-card/50 text-center">
                    <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bar Chart */}
              <div className="rounded-2xl border border-border bg-card/50 p-6 mb-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top 20 Countries by Nobel Laureates</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCountries} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(d: any) => setSelectedCountry(d.country)}
                    >
                      {topCountries.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Country Grid */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                {countryData.map((c, i) => (
                  <motion.button
                    key={c.country}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    onClick={() => setSelectedCountry(selectedCountry === c.country ? null : c.country)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedCountry === c.country
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{c.country}</span>
                      <span className="text-xs font-bold text-primary">{c.count}</span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {c.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{cat}</span>
                      ))}
                      {c.categories.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">+{c.categories.length - 3}</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Selected Country Detail */}
              {selectedData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-primary/20 bg-card/50 p-6"
                >
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{selectedData.country}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{selectedData.count} laureates across {selectedData.categories.length} categories</p>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-80 overflow-y-auto">
                    {selectedData.laureates.map((l: any) => (
                      <Link
                        key={l.id}
                        to={`/laureates/${l.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-all group"
                      >
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {l.first_name} {l.last_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{l.category} · {l.year}</p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default WorldMapPage;

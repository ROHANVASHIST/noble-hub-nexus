import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const DECADE_DETAILS = [
  { decade: "1900s", highlight: "First Nobel Prizes awarded in 1901. Röntgen wins Physics for X-rays.", count: 41 },
  { decade: "1910s", highlight: "WWI disrupts prizes. Einstein publishes General Relativity (1915).", count: 22 },
  { decade: "1920s", highlight: "Niels Bohr wins Physics. Insulin discovery wins Medicine.", count: 41 },
  { decade: "1930s", highlight: "First neutron discoveries. Literature prizes gain global attention.", count: 35 },
  { decade: "1940s", highlight: "WWII causes multiple gaps. Penicillin pioneers recognized.", count: 30 },
  { decade: "1950s", highlight: "DNA structure discovered. Cold War shapes Peace prizes.", count: 48 },
  { decade: "1960s", highlight: "Economics Prize established 1968. MLK wins Peace.", count: 54 },
  { decade: "1970s", highlight: "Golden age of particle physics. Kahneman's behavioral economics emerges.", count: 70 },
  { decade: "1980s", highlight: "HIV/AIDS research accelerates. Genetic engineering breakthroughs.", count: 73 },
  { decade: "1990s", highlight: "Human genome project era. Climate science gains recognition.", count: 77 },
  { decade: "2000s", highlight: "Graphene, dark energy, and stem cells. More collaborative prizes.", count: 87 },
  { decade: "2010s", highlight: "CRISPR, gravitational waves, immunotherapy recognized.", count: 91 },
  { decade: "2020s", highlight: "mRNA vaccines, AI breakthroughs, quantum computing advances.", count: 45 },
];

const AGE_DATA = [
  { age: "25-34", Physics: 8, Chemistry: 3, Medicine: 5, Literature: 1, Peace: 4, Economics: 0 },
  { age: "35-44", Physics: 25, Chemistry: 15, Medicine: 22, Literature: 3, Peace: 12, Economics: 2 },
  { age: "45-54", Physics: 52, Chemistry: 45, Medicine: 48, Literature: 18, Peace: 25, Economics: 15 },
  { age: "55-64", Physics: 68, Chemistry: 62, Medicine: 55, Literature: 42, Peace: 30, Economics: 35 },
  { age: "65-74", Physics: 45, Chemistry: 48, Medicine: 42, Literature: 35, Peace: 22, Economics: 28 },
  { age: "75-84", Physics: 18, Chemistry: 15, Medicine: 12, Literature: 15, Peace: 10, Economics: 12 },
  { age: "85+", Physics: 5, Chemistry: 4, Medicine: 3, Literature: 5, Peace: 2, Economics: 3 },
];

const COLORS = ['hsl(220, 60%, 55%)', 'hsl(155, 55%, 45%)', 'hsl(350, 55%, 55%)', 'hsl(42, 65%, 58%)', 'hsl(200, 60%, 55%)', 'hsl(270, 50%, 55%)'];

const InteractiveTimeline = () => {
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "age">("timeline");

  const cumulativeData = useMemo(() => {
    let total = 0;
    return DECADE_DETAILS.map(d => {
      total += d.count;
      return { decade: d.decade, total, perDecade: d.count };
    });
  }, []);

  const detail = selectedDecade ? DECADE_DETAILS.find(d => d.decade === selectedDecade) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("timeline")}
          className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${view === "timeline" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}
        >
          Growth Timeline
        </button>
        <button
          onClick={() => setView("age")}
          className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${view === "age" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}
        >
          Age at Award
        </button>
      </div>

      {view === "timeline" ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 16%)" />
              <XAxis dataKey="decade" tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 16%)', borderRadius: '8px', color: 'hsl(220 10% 95%)' }} />
              <Line type="monotone" dataKey="total" stroke="hsl(42, 65%, 58%)" strokeWidth={3} dot={{ fill: 'hsl(42, 65%, 58%)', r: 5, cursor: 'pointer' }}
                activeDot={{ r: 8, fill: 'hsl(42, 65%, 58%)', stroke: 'hsl(42, 65%, 30%)', strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="perDecade" stroke="hsl(220, 60%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>

          {/* Clickable decade cards */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {DECADE_DETAILS.map((d, i) => (
              <motion.button
                key={d.decade}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDecade(selectedDecade === d.decade ? null : d.decade)}
                className={`shrink-0 rounded-xl border p-3 text-center transition-all min-w-[80px] ${selectedDecade === d.decade ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/50 text-muted-foreground hover:border-primary/30"}`}
              >
                <div className="text-xs font-bold">{d.decade}</div>
                <div className="text-lg font-display font-bold mt-1">{d.count}</div>
              </motion.button>
            ))}
          </div>

          {detail && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">{detail.decade}</span>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{detail.highlight}</p>
            </motion.div>
          )}
        </>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={AGE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 16%)" />
            <XAxis dataKey="age" tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 16%)', borderRadius: '8px', color: 'hsl(220 10% 95%)' }} />
            <Bar dataKey="Physics" stackId="a" fill={COLORS[0]} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Chemistry" stackId="a" fill={COLORS[1]} />
            <Bar dataKey="Medicine" stackId="a" fill={COLORS[2]} />
            <Bar dataKey="Literature" stackId="a" fill={COLORS[3]} />
            <Bar dataKey="Peace" stackId="a" fill={COLORS[4]} />
            <Bar dataKey="Economics" stackId="a" fill={COLORS[5]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InteractiveTimeline;

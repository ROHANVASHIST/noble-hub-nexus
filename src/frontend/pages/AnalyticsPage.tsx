import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import StatCard from "@/frontend/components/cards/StatCard";
import InteractiveTimeline from "@/frontend/components/InteractiveTimeline";
import { ANALYTICS_DATA } from "@/backend/data/mock-data";
import { Award, BookOpen, Video, Globe, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Treemap } from "recharts";

const stats = [
  { icon: Award, label: "Total Laureates", value: ANALYTICS_DATA.stats.totalLaureates },
  { icon: TrendingUp, label: "Total Prizes", value: ANALYTICS_DATA.stats.totalPrizes },
  { icon: Video, label: "Lectures", value: ANALYTICS_DATA.stats.totalLectures },
  { icon: BookOpen, label: "Research Papers", value: ANALYTICS_DATA.stats.totalPapers },
  { icon: Globe, label: "Countries", value: ANALYTICS_DATA.stats.countries },
  { icon: Users, label: "Years of History", value: ANALYTICS_DATA.stats.yearsOfHistory },
];

const CHART_COLORS = ['hsl(220, 60%, 55%)', 'hsl(155, 55%, 45%)', 'hsl(350, 55%, 55%)', 'hsl(42, 65%, 58%)', 'hsl(200, 60%, 55%)', 'hsl(270, 50%, 55%)'];

const AnalyticsPage = () => (
  <PageLayout>
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="mt-2 text-muted-foreground">Explore trends, patterns, and statistics across Nobel Prize history.</p>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Prizes by Decade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Prizes by Decade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ANALYTICS_DATA.prizesByDecade}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 16%)" />
              <XAxis dataKey="decade" tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 16%)', borderRadius: '8px', color: 'hsl(220 10% 95%)' }}
              />
              <Bar dataKey="Physics" fill={CHART_COLORS[0]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Chemistry" fill={CHART_COLORS[1]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Medicine" fill={CHART_COLORS[2]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Economics" fill={CHART_COLORS[5]} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Wordmapper: Nobel Prize Worlds (Treemap) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Nobel Prize Worlds</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold uppercase">Wordmapper Mode</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Countries sized by their number of Nobel Laureates.</p>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={ANALYTICS_DATA.countryDistribution.map(d => ({ name: d.country, value: d.count }))}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="hsl(220 20% 16%)"
              fill="hsl(220 60% 55%)"
            >
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 16%)', borderRadius: '8px', color: 'hsl(220 10% 95%)' }}
              />
            </Treemap>
          </ResponsiveContainer>
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ANALYTICS_DATA.genderDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="count"
                nameKey="gender"
              >
                {ANALYTICS_DATA.genderDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 16%)', borderRadius: '8px', color: 'hsl(220 10% 95%)' }}
              />
              <Legend wrapperStyle={{ color: 'hsl(220 10% 65%)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* RoyalSloth: Nobel Prize in Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Nobel Prize in Numbers</h3>
            <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full font-bold uppercase">RoyalSloth Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Youngest laureate", value: "17", sub: "Malala Yousafzai (2014)" },
              { label: "Oldest laureate", value: "97", sub: "John B. Goodenough (2019)" },
              { label: "Women Laureates", value: "65", sub: "Since 1901" },
              { label: "Multiple Prizes", value: "6", sub: "Individuals/Orgs" },
              { label: "Most cited paper", value: "65K+", sub: "Prospect Theory" },
              { label: "Shared Prizes", value: "54%", sub: "Of all prizes awarded" },
            ].map((insight, i) => (
              <div key={i} className="flex flex-col justify-center rounded-lg bg-secondary/50 p-4 border border-border/30 hover:border-primary/20 transition-all">
                <p className="text-2xl font-display font-bold text-primary">{insight.value}</p>
                <h4 className="text-xs font-semibold text-foreground mt-1">{insight.label}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{insight.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Interactive Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Interactive Timeline</h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold uppercase">Explore</span>
          </div>
          <InteractiveTimeline />
        </motion.div>
      </div>
    </div>
  </PageLayout>
);

export default AnalyticsPage;

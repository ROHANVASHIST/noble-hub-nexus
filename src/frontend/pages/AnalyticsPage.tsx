import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import StatCard from "@/frontend/components/cards/StatCard";
import { ANALYTICS_DATA } from "@/backend/data/mock-data";
import { Award, BookOpen, Video, Globe, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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

        {/* Country Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Countries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ANALYTICS_DATA.countryDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 16%)" />
              <XAxis type="number" tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
              <YAxis dataKey="country" type="category" width={100} tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 16%)', borderRadius: '8px', color: 'hsl(220 10% 95%)' }}
              />
              <Bar dataKey="count" fill="hsl(42 65% 58%)" radius={[0, 4, 4, 0]} />
            </BarChart>
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

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Insights</h3>
          <div className="space-y-4">
            {[
              { label: "Youngest laureate", value: "Malala Yousafzai (17 years old, 2014)" },
              { label: "Most prizes in one category", value: "Physics (225 laureates)" },
              { label: "Most common nationality", value: "United States (400+ laureates)" },
              { label: "First female laureate", value: "Marie Curie (1903, Physics)" },
              { label: "Most cited paper", value: "Prospect Theory (65,000 citations)" },
              { label: "Longest Nobel lecture", value: "55 minutes (R. Feynman, 1965)" },
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">{insight.label}</p>
                  <p className="text-xs text-muted-foreground">{insight.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </PageLayout>
);

export default AnalyticsPage;

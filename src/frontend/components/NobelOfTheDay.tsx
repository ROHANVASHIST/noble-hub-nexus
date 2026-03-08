import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, ArrowRight, Calendar, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Laureate {
  id: string;
  first_name: string;
  last_name: string;
  category: string;
  year: number;
  nationality: string;
  motivation: string;
  institution: string;
  photo: string | null;
}

const FUN_FACTS = [
  { fact: "Marie Curie is the only person to win Nobel Prizes in two different sciences (Physics 1903, Chemistry 1911).", icon: "🧪" },
  { fact: "Malala Yousafzai is the youngest Nobel laureate, winning the Peace Prize at age 17 in 2014.", icon: "🕊️" },
  { fact: "John B. Goodenough won the Chemistry Prize at age 97, making him the oldest Nobel laureate.", icon: "🔋" },
  { fact: "The Nobel Prize medal depicts Alfred Nobel and weighs approximately 175 grams of 18-karat green gold.", icon: "🏅" },
  { fact: "Linus Pauling is the only person to win two unshared Nobel Prizes: Chemistry (1954) and Peace (1962).", icon: "✌️" },
  { fact: "During WWII, two Nobel medals were dissolved in aqua regia to hide them from the Nazis, then recast after the war.", icon: "⚗️" },
  { fact: "The Nobel Prize in Economics was not in Alfred Nobel's original will — it was established by Sweden's central bank in 1968.", icon: "📊" },
  { fact: "Six laureates have declined the Nobel Prize, including Jean-Paul Sartre (Literature 1964) who refused on principle.", icon: "📚" },
  { fact: "Frederick Sanger is the only person to win the Nobel Prize in Chemistry twice (1958 and 1980).", icon: "🧬" },
  { fact: "The longest gap between a discovery and receiving the Nobel Prize is 55 years (Peyton Rous, Medicine 1966).", icon: "⏳" },
];

const NobelOfTheDay = ({ laureates }: { laureates: Laureate[] | undefined }) => {
  const { dailyLaureate, dailyFacts } = useMemo(() => {
    if (!laureates || laureates.length === 0) return { dailyLaureate: null, dailyFacts: [] };
    // Deterministic "random" based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const idx = dayOfYear % laureates.length;
    const factIdx1 = dayOfYear % FUN_FACTS.length;
    const factIdx2 = (dayOfYear + 3) % FUN_FACTS.length;
    const factIdx3 = (dayOfYear + 7) % FUN_FACTS.length;
    return {
      dailyLaureate: laureates[idx],
      dailyFacts: [FUN_FACTS[factIdx1], FUN_FACTS[factIdx2], FUN_FACTS[factIdx3]],
    };
  }, [laureates]);

  if (!dailyLaureate) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Nobel of the Day */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/5 via-card/50 to-card/30 p-8 shadow-2xl shadow-primary/5"
      >
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Nobel of the Day</span>
          </div>

          <div className="flex items-start gap-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 bg-secondary">
              <img
                src={dailyLaureate.photo || `https://ui-avatars.com/api/?name=${dailyLaureate.first_name}+${dailyLaureate.last_name}&background=random&size=200`}
                alt={`${dailyLaureate.first_name} ${dailyLaureate.last_name}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${dailyLaureate.first_name}+${dailyLaureate.last_name}&background=random&size=200`;
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
                {dailyLaureate.first_name} {dailyLaureate.last_name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                  <Award className="h-3 w-3" /> {dailyLaureate.category} · {dailyLaureate.year}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Globe className="h-3 w-3" /> {dailyLaureate.nationality}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground leading-relaxed italic line-clamp-3">"{dailyLaureate.motivation}"</p>

          <Link to={`/laureates/${dailyLaureate.id}`}>
            <Button variant="outline" className="mt-6 rounded-xl gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary text-xs font-bold uppercase tracking-widest">
              Explore Profile <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] border border-border bg-card/30 p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Did You Know?</span>
        </div>
        <div className="space-y-5">
          {dailyFacts.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex gap-4 rounded-2xl border border-border/50 bg-secondary/30 p-4 hover:border-primary/20 transition-all"
            >
              <span className="text-2xl shrink-0">{f.icon}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.fact}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NobelOfTheDay;

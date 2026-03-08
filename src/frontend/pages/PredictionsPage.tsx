import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { NobelCategory } from "@/backend/data/mock-data";
import { Sparkles, Trophy, Send, ThumbsUp, Calendar, Award, Brain, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { useScholarData } from "@/frontend/hooks/useScholarData";

const ALL_CATEGORIES: NobelCategory[] = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"];

const TRENDING_PREDICTIONS = [
  { name: "Demis Hassabis", field: "AI & Protein Folding", category: "Chemistry" as NobelCategory, votes: 342 },
  { name: "Katalin Karikó", field: "mRNA Technology", category: "Medicine" as NobelCategory, votes: 289 },
  { name: "Geoffrey Hinton", field: "Deep Learning", category: "Physics" as NobelCategory, votes: 256 },
  { name: "Svetlana Alexievich", field: "Documentary Literature", category: "Literature" as NobelCategory, votes: 178 },
  { name: "Greta Thunberg", field: "Climate Activism", category: "Peace" as NobelCategory, votes: 445 },
  { name: "Daron Acemoglu", field: "Institutional Economics", category: "Economics" as NobelCategory, votes: 201 },
];

const PredictionsPage = () => {
  const { session } = useAuth();
  const { addNote } = useScholarData();
  const [category, setCategory] = useState<NobelCategory>("Physics");
  const [name, setName] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [predictions, setPredictions] = useState<Array<{ category: NobelCategory; name: string; reasoning: string; date: string }>>([]);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  const handleSubmit = async () => {
    if (!name.trim() || !reasoning.trim()) {
      toast.error("Please fill in both name and reasoning");
      return;
    }
    const pred = { category, name: name.trim(), reasoning: reasoning.trim(), date: new Date().toISOString().split("T")[0] };
    setPredictions(prev => [pred, ...prev]);

    // Save as a note
    await addNote({
      title: `Nobel Prediction: ${name} (${category})`,
      content: `**Predicted Winner:** ${name}\n**Category:** ${category}\n**Reasoning:** ${reasoning}\n\n*Submitted: ${pred.date}*`,
      type: "insight",
    });

    setName("");
    setReasoning("");
    toast.success("Prediction submitted and saved to your notes!");
  };

  const handleVote = (idx: number) => {
    if (votedIds.has(idx)) {
      toast.info("Already voted!");
      return;
    }
    setVotedIds(prev => new Set(prev).add(idx));
    toast.success("Vote recorded!");
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Prediction Engine</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Nobel <span className="text-gradient-gold">Predictions</span></h1>
          <p className="mt-2 text-muted-foreground max-w-xl">Who do you think will win the next Nobel Prize? Submit your predictions with reasoning.</p>
        </motion.div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr,400px]">
          {/* Main content */}
          <div className="space-y-12">
            {/* Submit Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Send className="h-5 w-5 text-primary" /> Submit Your Prediction
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setCategory(cat)}
                        className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${category === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Predicted Winner</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" className="rounded-xl h-12" />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Your Reasoning</label>
                  <Textarea value={reasoning} onChange={e => setReasoning(e.target.value)}
                    placeholder="Why do you think they deserve the Nobel Prize? What's their key contribution?"
                    className="rounded-xl min-h-[120px]" />
                </div>

                <Button onClick={handleSubmit} disabled={!name.trim() || !reasoning.trim()} className="w-full h-12 rounded-2xl gap-2 font-bold">
                  <Sparkles className="h-4 w-4" /> Submit Prediction
                </Button>
              </div>
            </motion.div>

            {/* Your Predictions */}
            {predictions.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Your Predictions</h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {predictions.map((p, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-bold">{p.name}</h3>
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{p.category} · {p.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{p.reasoning}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Trending Predictions */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Trending Predictions
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {TRENDING_PREDICTIONS.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.field}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{p.category}</span>
                      </div>
                      <button
                        onClick={() => handleVote(i)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${votedIds.has(i) ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-muted-foreground"}`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${votedIds.has(i) ? "fill-current" : ""}`} />
                        <span className="text-[10px] font-bold">{p.votes + (votedIds.has(i) ? 1 : 0)}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card/50 p-6 sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Prediction Tips
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="text-lg">🔬</span>
                  <p>Look for researchers whose work has had 20+ years of proven impact</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📊</span>
                  <p>High citation counts (10,000+) often correlate with Nobel recognition</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🏛️</span>
                  <p>Prior recognition (Lasker, Fields, Wolf prizes) is a strong indicator</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🌍</span>
                  <p>The committee often recognizes work that addresses global challenges</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">⏰</span>
                  <p>Nobel announcements happen every October — plan ahead!</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Next Announcements</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>🧬 Medicine: Oct 6, 2026</p>
                  <p>⚛️ Physics: Oct 7, 2026</p>
                  <p>🧪 Chemistry: Oct 8, 2026</p>
                  <p>📚 Literature: Oct 9, 2026</p>
                  <p>🕊️ Peace: Oct 10, 2026</p>
                  <p>📊 Economics: Oct 13, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PredictionsPage;

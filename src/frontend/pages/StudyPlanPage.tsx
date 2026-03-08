import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { BookOpen, Brain, Loader2, Sparkles, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const INTEREST_OPTIONS = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "PhD Researcher"];

const StudyPlanPage = () => {
  const [interests, setInterests] = useState<string[]>([]);
  const [level, setLevel] = useState("Intermediate");
  const [weeklyHours, setWeeklyHours] = useState("10");
  const [goals, setGoals] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const generatePlan = async () => {
    if (interests.length === 0) { toast.error("Select at least one interest"); return; }
    setLoading(true);
    setPlan("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ interests: interests.join(", "), currentLevel: level, weeklyHours, goals }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast.error(err.error || "Failed to generate plan");
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buf = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { result += c; setPlan(result); }
          } catch {}
        }
      }
    } catch (e) {
      toast.error("Failed to generate study plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Study Plan Generator</h1>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </div>
          <p className="text-muted-foreground">Get a personalized weekly study plan based on your interests and goals.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Interests</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(i => (
                <Badge key={i} variant={interests.includes(i) ? "default" : "outline"} className="cursor-pointer text-sm px-3 py-1" onClick={() => toggleInterest(i)}>{i}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Level</label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVEL_OPTIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Weekly hours</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input type="number" min="1" max="60" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Specific goals (optional)</label>
                <Input placeholder="e.g., Prepare for quantum physics exam" value={goals} onChange={e => setGoals(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-center">
          <Button size="lg" onClick={generatePlan} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate Study Plan"}
          </Button>
        </div>

        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>Your Personalized Study Plan</CardTitle></CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default StudyPlanPage;

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchLaureates } from "@/backend/services/laureates";
import { GitCompareArrows, ArrowRight, Users } from "lucide-react";

const ComparePage = () => {
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  const { data: laureates = [], isLoading } = useQuery({
    queryKey: ["compare-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const left = useMemo(() => laureates.find((l: any) => l.id === leftId), [laureates, leftId]);
  const right = useMemo(() => laureates.find((l: any) => l.id === rightId), [laureates, rightId]);

  const fields = useMemo(() => {
    if (!left || !right) return [];
    return [
      { label: "Category", left: left.category, right: right.category },
      { label: "Year", left: String(left.year), right: String(right.year) },
      { label: "Nationality", left: left.nationality, right: right.nationality },
      { label: "Institution", left: left.institution || "N/A", right: right.institution || "N/A" },
      { label: "Born", left: String(left.birth_year), right: String(right.birth_year) },
      { label: "Age at Prize", left: String(left.year - left.birth_year), right: String(right.year - right.birth_year) },
      { label: "Lifespan", left: left.death_year ? `${left.death_year - left.birth_year} years` : "Alive", right: right.death_year ? `${right.death_year - right.birth_year} years` : "Alive" },
    ];
  }, [left, right]);

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <GitCompareArrows className="h-8 w-8 text-primary" /> Side-by-Side Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Compare two Nobel laureates across categories, achievements, and timelines.</p>
        </motion.div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Laureate A</label>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger><SelectValue placeholder="Select laureate..." /></SelectTrigger>
              <SelectContent className="max-h-60">
                {laureates.filter((l: any) => l.id !== rightId).map((l: any) => (
                  <SelectItem key={l.id} value={l.id}>{l.first_name} {l.last_name} ({l.year})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Laureate B</label>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger><SelectValue placeholder="Select laureate..." /></SelectTrigger>
              <SelectContent className="max-h-60">
                {laureates.filter((l: any) => l.id !== leftId).map((l: any) => (
                  <SelectItem key={l.id} value={l.id}>{l.first_name} {l.last_name} ({l.year})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison */}
        {left && right ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Headers */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
              <Card className="text-center">
                <CardContent className="pt-6 pb-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-2">
                    {left.first_name[0]}{left.last_name[0]}
                  </div>
                  <h3 className="font-semibold text-foreground">{left.first_name} {left.last_name}</h3>
                  <Badge variant="secondary" className="mt-1">{left.category}</Badge>
                </CardContent>
              </Card>
              <div className="flex items-center"><span className="text-muted-foreground font-medium text-sm">VS</span></div>
              <Card className="text-center">
                <CardContent className="pt-6 pb-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-accent/30 flex items-center justify-center text-2xl font-bold text-accent-foreground mb-2">
                    {right.first_name[0]}{right.last_name[0]}
                  </div>
                  <h3 className="font-semibold text-foreground">{right.first_name} {right.last_name}</h3>
                  <Badge variant="secondary" className="mt-1">{right.category}</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Stats Table */}
            <Card>
              <CardContent className="pt-4 divide-y divide-border">
                {fields.map((f, i) => (
                  <motion.div key={f.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-3 py-3 text-sm">
                    <div className={`text-right pr-4 font-medium ${f.left === f.right ? "text-foreground" : "text-primary"}`}>{f.left}</div>
                    <div className="text-center text-muted-foreground">{f.label}</div>
                    <div className={`text-left pl-4 font-medium ${f.left === f.right ? "text-foreground" : "text-primary"}`}>{f.right}</div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Motivations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Motivation</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground italic">"{left.motivation}"</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Motivation</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground italic">"{right.motivation}"</p></CardContent>
              </Card>
            </div>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select two laureates above to compare them side by side.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ComparePage;

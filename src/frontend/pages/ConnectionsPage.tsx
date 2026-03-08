import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { fetchLaureates } from "@/backend/services/laureates";
import { Button } from "@/components/ui/button";
import { Search, Link2, Award, ArrowRight, Sparkles, Loader2, Globe, GraduationCap, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Connection {
  type: "institution" | "nationality" | "category" | "year" | "decade";
  label: string;
  via: string;
}

const ConnectionsPage = () => {
  const { data: laureates, isLoading } = useQuery({
    queryKey: ["connections-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const [laureateA, setLaureateA] = useState("");
  const [laureateB, setLaureateB] = useState("");
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [showResults, setShowResults] = useState(false);

  const suggestionsA = useMemo(() => {
    if (!laureates || searchA.length < 2) return [];
    return laureates.filter(l => `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchA.toLowerCase())).slice(0, 5);
  }, [laureates, searchA]);

  const suggestionsB = useMemo(() => {
    if (!laureates || searchB.length < 2) return [];
    return laureates.filter(l => `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchB.toLowerCase())).slice(0, 5);
  }, [laureates, searchB]);

  const personA = useMemo(() => laureates?.find(l => l.id === laureateA), [laureates, laureateA]);
  const personB = useMemo(() => laureates?.find(l => l.id === laureateB), [laureates, laureateB]);

  const connections = useMemo((): Connection[] => {
    if (!personA || !personB || !laureates) return [];
    const conns: Connection[] = [];

    // Direct connections
    if (personA.nationality === personB.nationality) {
      conns.push({ type: "nationality", label: "Same Nationality", via: personA.nationality });
    }
    if (personA.category === personB.category) {
      conns.push({ type: "category", label: "Same Category", via: personA.category });
    }
    if (personA.institution === personB.institution && personA.institution) {
      conns.push({ type: "institution", label: "Same Institution", via: personA.institution });
    }
    if (personA.year === personB.year) {
      conns.push({ type: "year", label: "Same Year", via: personA.year.toString() });
    }
    const decadeA = Math.floor(personA.year / 10) * 10;
    const decadeB = Math.floor(personB.year / 10) * 10;
    if (decadeA === decadeB) {
      conns.push({ type: "decade", label: "Same Decade", via: `${decadeA}s` });
    }

    // Indirect connections via shared attributes with intermediaries
    if (conns.length === 0) {
      // Find intermediaries who share something with both
      const intermediaries = laureates.filter(l => l.id !== personA.id && l.id !== personB.id);
      for (const mid of intermediaries) {
        const sharesWithA = mid.nationality === personA.nationality || mid.category === personA.category || mid.institution === personA.institution;
        const sharesWithB = mid.nationality === personB.nationality || mid.category === personB.category || mid.institution === personB.institution;
        if (sharesWithA && sharesWithB) {
          const sharedA = mid.nationality === personA.nationality ? "nationality" : mid.category === personA.category ? "category" : "institution";
          const sharedB = mid.nationality === personB.nationality ? "nationality" : mid.category === personB.category ? "category" : "institution";
          conns.push({
            type: "institution",
            label: `Connected via ${mid.first_name} ${mid.last_name}`,
            via: `${personA.first_name} → (${sharedA}) → ${mid.first_name} ${mid.last_name} → (${sharedB}) → ${personB.first_name}`,
          });
          if (conns.length >= 3) break;
        }
      }
    }

    return conns;
  }, [personA, personB, laureates]);

  const handleFind = () => {
    if (!laureateA || !laureateB) {
      toast.error("Please select two laureates");
      return;
    }
    if (laureateA === laureateB) {
      toast.error("Please select two different laureates");
      return;
    }
    setShowResults(true);
    toast.success("Connection analysis complete!");
  };

  const CONNECTION_ICONS: Record<string, any> = {
    nationality: Globe,
    category: Award,
    institution: GraduationCap,
    year: Calendar,
    decade: Calendar,
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Connection Engine</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Six Degrees of <span className="text-gradient-gold">Nobel</span></h1>
          <p className="mt-2 text-muted-foreground max-w-xl">Discover hidden connections between any two Nobel laureates through shared institutions, nationalities, categories, and more.</p>
        </motion.div>

        <div className="mt-12 mx-auto max-w-3xl">
          {/* Selection */}
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
            {/* Laureate A */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Laureate A</label>
              {personA ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{personA.first_name} {personA.last_name}</h3>
                      <p className="text-xs text-muted-foreground">{personA.category} · {personA.year}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setLaureateA(""); setSearchA(""); setShowResults(false); }}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchA}
                    onChange={e => setSearchA(e.target.value)}
                    placeholder="Search laureate..."
                    className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                  {suggestionsA.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      {suggestionsA.map(l => (
                        <button key={l.id} onClick={() => { setLaureateA(l.id); setSearchA(""); setShowResults(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-border last:border-0">
                          <div className="font-bold text-sm">{l.first_name} {l.last_name}</div>
                          <div className="text-[10px] text-muted-foreground">{l.category} · {l.year} · {l.nationality}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connector */}
            <div className="flex items-center justify-center pt-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Laureate B */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Laureate B</label>
              {personB ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{personB.first_name} {personB.last_name}</h3>
                      <p className="text-xs text-muted-foreground">{personB.category} · {personB.year}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setLaureateB(""); setSearchB(""); setShowResults(false); }}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchB}
                    onChange={e => setSearchB(e.target.value)}
                    placeholder="Search laureate..."
                    className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                  {suggestionsB.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      {suggestionsB.map(l => (
                        <button key={l.id} onClick={() => { setLaureateB(l.id); setSearchB(""); setShowResults(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-border last:border-0">
                          <div className="font-bold text-sm">{l.first_name} {l.last_name}</div>
                          <div className="text-[10px] text-muted-foreground">{l.category} · {l.year} · {l.nationality}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={handleFind} disabled={!laureateA || !laureateB || isLoading} className="h-14 px-12 rounded-2xl text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Find Connections
            </Button>
          </div>

          {/* Results */}
          {showResults && personA && personB && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-6">
              <h2 className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {connections.length} connection{connections.length !== 1 ? "s" : ""} found between
                <span className="text-primary"> {personA.first_name}</span> and
                <span className="text-primary"> {personB.first_name}</span>
              </h2>

              {connections.length > 0 ? (
                <div className="space-y-4">
                  {connections.map((conn, i) => {
                    const Icon = CONNECTION_ICONS[conn.type] || Link2;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-sm">{conn.label}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{conn.via}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 rounded-3xl bg-secondary/20 border border-dashed border-border">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground">No direct connections found</h3>
                  <p className="text-sm text-muted-foreground mt-2">These laureates don't share institutions, nationalities, categories, or time periods in our database.</p>
                </div>
              )}

              {/* Side-by-side */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                {[personA, personB].map(p => (
                  <Link key={p.id} to={`/laureates/${p.id}`} className="rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/30 transition-all group">
                    <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">{p.first_name} {p.last_name}</h3>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p><span className="font-bold text-foreground">Category:</span> {p.category}</p>
                      <p><span className="font-bold text-foreground">Year:</span> {p.year}</p>
                      <p><span className="font-bold text-foreground">Nationality:</span> {p.nationality}</p>
                      <p><span className="font-bold text-foreground">Institution:</span> {p.institution}</p>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">"{p.motivation}"</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-widest">
                      View Profile <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ConnectionsPage;

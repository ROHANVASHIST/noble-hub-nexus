import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchLaureates } from "@/backend/services/laureates";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { FileText, Copy, Check, Search, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CitationStyle = "apa" | "mla" | "chicago" | "bibtex";

const CitationGeneratorPage = () => {
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: laureates = [], isLoading: loadingL } = useQuery({
    queryKey: ["citation-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const { data: papers = [], isLoading: loadingP } = useQuery({
    queryKey: ["citation-papers"],
    queryFn: async () => {
      const { data } = await supabase.from("research_papers").select("*").limit(200);
      return data || [];
    },
  });

  const filteredLaureates = useMemo(() => {
    if (!search.trim()) return laureates.slice(0, 20);
    const q = search.toLowerCase();
    return laureates.filter(l =>
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [laureates, search]);

  const filteredPapers = useMemo(() => {
    if (!search.trim()) return papers.slice(0, 20);
    const q = search.toLowerCase();
    return papers.filter((p: any) =>
      p.title.toLowerCase().includes(q) ||
      (p.authors || []).some((a: string) => a.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [papers, search]);

  const generateLaureateCitation = (l: any, s: CitationStyle): string => {
    const name = `${l.last_name}, ${l.first_name.charAt(0)}.`;
    const fullName = `${l.first_name} ${l.last_name}`;
    switch (s) {
      case "apa":
        return `Nobel Prize. (${l.year}). ${fullName} – ${l.category}. Nobel Prize Outreach AB. https://www.nobelprize.org/`;
      case "mla":
        return `"${fullName}." Nobel Prize, ${l.year}, www.nobelprize.org/.`;
      case "chicago":
        return `Nobel Prize. "${fullName} – Nobel Prize in ${l.category} ${l.year}." Nobel Prize Outreach AB. Accessed ${new Date().getFullYear()}. https://www.nobelprize.org/.`;
      case "bibtex":
        return `@misc{nobel_${l.last_name.toLowerCase()}_${l.year},\n  title = {${fullName} -- Nobel Prize in ${l.category}},\n  year = {${l.year}},\n  url = {https://www.nobelprize.org/}\n}`;
      default:
        return "";
    }
  };

  const generatePaperCitation = (p: any, s: CitationStyle): string => {
    const authors = (p.authors || []).join(", ");
    const shortAuthor = (p.authors || [])[0] || "Unknown";
    switch (s) {
      case "apa":
        return `${authors} (${p.year}). ${p.title}. ${p.journal || "Journal"}. ${p.doi ? `https://doi.org/${p.doi}` : ""}`;
      case "mla":
        return `${authors}. "${p.title}." ${p.journal || "Journal"}, ${p.year}.`;
      case "chicago":
        return `${authors}. "${p.title}." ${p.journal || "Journal"} (${p.year}).`;
      case "bibtex":
        return `@article{${shortAuthor.split(" ").pop()?.toLowerCase()}_${p.year},\n  author = {${authors}},\n  title = {${p.title}},\n  journal = {${p.journal || ""}},\n  year = {${p.year}}\n}`;
      default:
        return "";
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Citation copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Citation Generator</h1>
              <p className="text-sm text-muted-foreground">Generate formatted citations for Nobel laureates and research papers.</p>
            </div>
          </div>

          {/* Style Selector */}
          <Tabs value={style} onValueChange={v => setStyle(v as CitationStyle)} className="mb-6">
            <TabsList className="rounded-xl">
              <TabsTrigger value="apa" className="rounded-lg text-xs font-bold">APA</TabsTrigger>
              <TabsTrigger value="mla" className="rounded-lg text-xs font-bold">MLA</TabsTrigger>
              <TabsTrigger value="chicago" className="rounded-lg text-xs font-bold">Chicago</TabsTrigger>
              <TabsTrigger value="bibtex" className="rounded-lg text-xs font-bold">BibTeX</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search laureates or papers..."
              className="rounded-xl pl-10"
            />
          </div>

          {(loadingL || loadingP) ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Laureate Citations */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="h-3 w-3" /> Nobel Laureates ({filteredLaureates.length})
                </h3>
                <div className="space-y-2">
                  {filteredLaureates.map(l => {
                    const citation = generateLaureateCitation(l, style);
                    const id = `l-${l.id}`;
                    return (
                      <div key={l.id} className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/20 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground mb-1">{l.first_name} {l.last_name} · {l.category} ({l.year})</p>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/20 p-2 rounded-lg">{citation}</pre>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(citation, id)}
                        >
                          {copiedId === id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paper Citations */}
              {filteredPapers.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Research Papers ({filteredPapers.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredPapers.map((p: any) => {
                      const citation = generatePaperCitation(p, style);
                      const id = `p-${p.id}`;
                      return (
                        <div key={p.id} className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/20 transition-all">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground mb-1 truncate">{p.title}</p>
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/20 p-2 rounded-lg">{citation}</pre>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(citation, id)}
                          >
                            {copiedId === id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default CitationGeneratorPage;

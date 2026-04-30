import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search, Loader2, ExternalLink, FileDown, Quote, Bookmark, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Paper {
  id: string;
  source: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  url: string;
  pdfUrl: string | null;
  doi: string | null;
  venue: string | null;
  citations: number | null;
}

interface ApiResponse {
  query: string;
  count: number;
  bySource: Record<string, Paper[]>;
  errors: string[];
  results: Paper[];
}

const SOURCES = [
  { id: "arxiv", label: "arXiv" },
  { id: "semantic_scholar", label: "Semantic Scholar" },
  { id: "openalex", label: "OpenAlex" },
  { id: "crossref", label: "Crossref" },
  { id: "pubmed", label: "PubMed" },
  { id: "doaj", label: "DOAJ" },
  { id: "nobel", label: "Nobel Prize" },
];

const SOURCE_COLOR: Record<string, string> = {
  "arXiv": "bg-red-500/15 text-red-400 border-red-500/30",
  "Semantic Scholar": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "OpenAlex": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Crossref": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "PubMed": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "DOAJ": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Nobel Prize": "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
};

const buildCitation = (p: Paper): string => {
  const authors = p.authors.length > 0
    ? (p.authors.length > 3 ? `${p.authors.slice(0, 3).join(", ")} et al.` : p.authors.join(", "))
    : "Unknown";
  const year = p.year ? `(${p.year})` : "";
  const venue = p.venue ? `${p.venue}.` : "";
  const doi = p.doi ? `https://doi.org/${p.doi}` : p.url;
  return `${authors} ${year}. ${p.title}. ${venue} ${doi}`.replace(/\s+/g, " ").trim();
};

export default function PaperSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>(
    Object.fromEntries(SOURCES.map((s) => [s.id, true]))
  );

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      toast.error("Enter at least 2 characters");
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const sources = Object.entries(enabledSources).filter(([, v]) => v).map(([k]) => k).join(",");
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/research-search?q=${encodeURIComponent(q)}&limit=12&sources=${sources}`;
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const r = await fetch(url, { headers });
      if (!r.ok) throw new Error(`Request failed: ${r.status}`);
      const json: ApiResponse = await r.json();
      setData(json);
      setActiveTab("all");
      if (json.count === 0) toast.info("No results found across selected sources");
      else toast.success(`Found ${json.count} papers across ${Object.keys(json.bySource).length} sources`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Search failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const copyCitation = (p: Paper) => {
    navigator.clipboard.writeText(buildCitation(p));
    toast.success("Citation copied");
  };

  const saveBookmark = (p: Paper) => {
    try {
      const KEY = "nobelhub:saved-papers";
      const raw = localStorage.getItem(KEY);
      const list: Paper[] = raw ? JSON.parse(raw) : [];
      if (list.some((x) => x.id === p.id)) {
        toast.info("Already saved");
        return;
      }
      list.unshift(p);
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
      toast.success("Saved to your reading list");
    } catch {
      toast.error("Could not save");
    }
  };

  const tabs = [
    { id: "all", label: "All", count: data?.count ?? 0 },
    ...SOURCES.map((s) => ({
      id: s.id,
      label: s.label,
      count: data?.bySource[s.id]?.length ?? 0,
    })),
  ];

  const visiblePapers: Paper[] =
    activeTab === "all" ? (data?.results ?? []) : (data?.bySource[activeTab] ?? []);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Live Search across 7 academic APIs · incl. official Nobel Prize
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search papers, e.g. 'CRISPR off-target effects', 'attention is all you need'..."
              className="pl-9 h-11"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 px-6">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => {
            const on = enabledSources[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setEnabledSources((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                }
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                  on
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {data && (
          <div className="pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1 bg-muted/30">
                {tabs.map((t) => (
                  <TabsTrigger key={t.id} value={t.id} className="text-xs gap-1.5">
                    {t.label}
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                      {t.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-3">
                {visiblePapers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No results from this source.
                  </p>
                ) : (
                  visiblePapers.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-lg border border-border/60 bg-card/40 p-4 transition hover:border-primary/40 hover:bg-card"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm leading-snug text-foreground hover:text-primary transition flex-1"
                        >
                          {p.title}
                        </a>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-1.5 py-0 h-5 ${SOURCE_COLOR[p.source] ?? ""}`}
                        >
                          {p.source}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                        {p.authors.length > 0 && (
                          <span className="truncate max-w-md">
                            {p.authors.slice(0, 3).join(", ")}
                            {p.authors.length > 3 && " et al."}
                          </span>
                        )}
                        {p.year && <span>· {p.year}</span>}
                        {p.venue && <span className="italic">· {p.venue}</span>}
                        {typeof p.citations === "number" && (
                          <span>· {p.citations.toLocaleString()} citations</span>
                        )}
                      </div>

                      {p.abstract && (
                        <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3 mb-3">
                          {p.abstract}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                          <a href={p.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </Button>
                        {p.pdfUrl && (
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                            <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <FileDown className="h-3 w-3" /> PDF
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => copyCitation(p)}>
                          <Quote className="h-3 w-3" /> Cite
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => saveBookmark(p)}>
                          <Bookmark className="h-3 w-3" /> Save
                        </Button>
                        {p.doi && (
                          <span className="text-[10px] text-muted-foreground/60 ml-auto">
                            DOI: {p.doi}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {data.errors.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-3">
                Note: {data.errors.join(", ")} returned no data (rate limit or network).
              </p>
            )}
          </div>
        )}

        {!data && !loading && (
          <p className="text-xs text-muted-foreground">
            Searches arXiv, Semantic Scholar, OpenAlex, Crossref, PubMed and DOAJ in parallel —
            no API keys required, all free academic sources.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

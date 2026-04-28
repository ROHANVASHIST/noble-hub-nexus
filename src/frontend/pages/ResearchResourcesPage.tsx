import { useMemo, useState } from "react";
import { ExternalLink, Search, BookOpen, GraduationCap, Users, PenTool, Library } from "lucide-react";
import PageLayout from "@/frontend/components/layout/PageLayout";
import PaperSearch from "@/frontend/components/research/PaperSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Resource {
  name: string;
  url: string;
  description: string;
  tags?: string[];
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  resources: Resource[];
}

const SECTIONS: Section[] = [
  {
    id: "search",
    title: "Academic Search Engines & Paper Access",
    subtitle: "Free access to millions of peer-reviewed articles, preprints and books.",
    icon: Search,
    resources: [
      { name: "Google Scholar", url: "https://scholar.google.com", description: "The primary search engine for scholarly literature across all disciplines.", tags: ["All fields"] },
      { name: "Semantic Scholar", url: "https://www.semanticscholar.org", description: "AI-powered engine with paper summaries and citation pattern tracking.", tags: ["AI"] },
      { name: "CORE", url: "https://core.ac.uk", description: "The largest aggregator of open-access papers from institutional repositories.", tags: ["Open Access"] },
      { name: "arXiv", url: "https://arxiv.org", description: "Leading repository for open-access STEM preprints.", tags: ["Preprints", "STEM"] },
      { name: "bioRxiv", url: "https://www.biorxiv.org", description: "Preprint server for the life sciences — read cutting-edge work pre-publication.", tags: ["Preprints", "Bio"] },
      { name: "DOAJ", url: "https://doaj.org", description: "Community-curated directory of high-quality, peer-reviewed open-access journals.", tags: ["Open Access"] },
      { name: "PubMed Central", url: "https://www.ncbi.nlm.nih.gov/pmc/", description: "Free archive of biomedical and life sciences literature from the US NIH.", tags: ["Biomedical"] },
      { name: "BASE", url: "https://www.base-search.net", description: "Bielefeld Academic Search Engine — over 240 million scholarly documents.", tags: ["All fields"] },
    ],
  },
  {
    id: "writing",
    title: "Reference Management & Writing Tools",
    subtitle: "Organise citations and improve the clarity of your dissertation chapters.",
    icon: PenTool,
    resources: [
      { name: "Zotero", url: "https://www.zotero.org", description: "Free, open-source citation manager that captures references from your browser.", tags: ["Citations", "Free"] },
      { name: "Mendeley", url: "https://www.mendeley.com", description: "Reference manager with a research social network for discovering papers.", tags: ["Citations"] },
      { name: "Overleaf", url: "https://www.overleaf.com", description: "Web-based LaTeX editor with real-time collaboration for academic writing.", tags: ["LaTeX"] },
      { name: "Grammarly", url: "https://www.grammarly.com", description: "Real-time grammar, style and clarity assistant for academic writing.", tags: ["Writing"] },
      { name: "Hemingway Editor", url: "https://hemingwayapp.com", description: "Highlights complex sentences and passive voice to improve readability.", tags: ["Writing"] },
    ],
  },
  {
    id: "theses",
    title: "Thesis Repositories",
    subtitle: "Browse completed theses to understand standard structures and find research gaps.",
    icon: GraduationCap,
    resources: [
      { name: "OATD", url: "https://oatd.org", description: "Open Access Theses and Dissertations from over 1,100 institutions.", tags: ["Global"] },
      { name: "EThOS (British Library)", url: "https://ethos.bl.uk", description: "UK's national service for doctoral research with thousands of free PhD theses.", tags: ["UK"] },
      { name: "Shodhganga", url: "https://shodhganga.inflibnet.ac.in", description: "Open-access digital repository of Indian doctoral theses and dissertations.", tags: ["India"] },
      { name: "NDLTD", url: "https://www.ndltd.org", description: "International network promoting electronic theses and dissertations.", tags: ["Global"] },
    ],
  },
  {
    id: "network",
    title: "Networking & Collaboration",
    subtitle: "Connect with scholars, share work and track your research impact.",
    icon: Users,
    resources: [
      { name: "ResearchGate", url: "https://www.researchgate.net", description: "Professional network where scholars share papers, ask questions and collaborate.", tags: ["Network"] },
      { name: "Academia.edu", url: "https://www.academia.edu", description: "Share research and monitor its impact through built-in analytics.", tags: ["Network"] },
    ],
  },
];

const ICON_BY_ID: Record<string, React.ComponentType<{ className?: string }>> = {
  search: Search, writing: PenTool, theses: GraduationCap, network: Users,
};

export default function ResearchResourcesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => ({
      ...s,
      resources: s.resources.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      ),
    })).filter((s) => s.resources.length > 0);
  }, [query]);

  const totalCount = SECTIONS.reduce((n, s) => n + s.resources.length, 0);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Library className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">External Resources</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-3">
            Research <span className="text-primary">Resources Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A curated gateway to the world's leading academic search engines, paper repositories,
            reference managers and scholarly networks. {totalCount} hand-picked tools, one click away.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources (e.g. 'preprint', 'citations', 'open access')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        {/* Quick jump */}
        <div className="flex flex-wrap gap-2 mb-10">
          {SECTIONS.map((s) => {
            const Icon = ICON_BY_ID[s.id];
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {s.title.split("&")[0].trim()}
              </a>
            );
          })}
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No resources match "{query}".
            </div>
          )}

          {filtered.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <div className="flex items-start gap-3 mb-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.resources.map((r) => (
                    <Card
                      key={r.name}
                      className="group border-border/60 bg-card/60 backdrop-blur transition-all hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start justify-between gap-2 text-base">
                          <span className="font-bold">{r.name}</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-primary" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {r.tags?.map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {t}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary hover:text-primary"
                          >
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              Open
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-16 rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <BookOpen className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p>
              These are external services maintained by their respective organisations. Links open in a new tab.
              NobelHub does not host or control content on these sites.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

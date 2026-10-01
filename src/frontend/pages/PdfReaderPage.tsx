import { useState } from "react";
import PdfViewer from "@/frontend/components/papers/PdfViewer";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/frontend/components/layout/PageLayout";
import Seo from "@/frontend/components/Seo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSavedPapers } from "@/frontend/hooks/useSavedPapers";
import { FileText, ExternalLink, Loader2, Sparkles, ArrowLeft, Check } from "lucide-react";

const toPdf = (p: { pdf_url: string | null; url: string }) => {
  if (p.pdf_url) return p.pdf_url.replace(/^http:\/\//, "https://");
  const m = p.url.match(/arxiv\.org\/abs\/([^?#]+)/);
  return m ? `https://arxiv.org/pdf/${m[1]}` : null;
};

const PdfReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { papers, isLoading, update, summarize } = useSavedPapers();
  const withPdf = papers.filter((p) => toPdf(p));
  const paper = papers.find((p) => p.id === id);
  const [wordCount, setWordCount] = useState(0);
  const [notesKey, setNotesKey] = useState(0);

  if (isLoading) {
    return <PageLayout><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></PageLayout>;
  }

  if (!paper) {
    return (
      <PageLayout>
        <Seo title="PDF Reader | Nobel Hub" description="Read your saved papers with notes side by side." />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">PDF Reader</h1>
              <p className="text-sm text-muted-foreground">Pick a saved paper to read with notes alongside.</p>
            </div>
          </div>
          {papers.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border">
              <p className="text-sm text-muted-foreground mb-4">No saved papers yet.</p>
              <Button asChild className="rounded-xl"><Link to="/resources">Find papers</Link></Button>
            </div>
          ) : (
            <div className="space-y-2">
              {papers.map((p) => (
                <button key={p.id} onClick={() => navigate(`/reader/${p.id}`)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card/50 hover:border-primary/40 transition-all">
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {toPdf(p) ? "PDF available" : "Opens publisher page"}{p.year ? ` · ${p.year}` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">{withPdf.length} of {papers.length} have a readable PDF.</p>
        </div>
      </PageLayout>
    );
  }

  const pdf = toPdf(paper);

  return (
    <PageLayout>
      <Seo title={`${paper.title} | Reader`} description="Read your saved paper with notes and AI summary." />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild><Link to="/reader"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="font-display text-lg font-bold text-foreground flex-1 min-w-0 truncate">{paper.title}</h1>
          {paper.status !== "read" && (
            <Button size="sm" variant="outline" className="gap-1 rounded-lg"
              onClick={() => update.mutate({ id: paper.id, patch: { status: "read" } })}>
              <Check className="h-3.5 w-3.5" /> Mark read
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1 rounded-lg" asChild>
            <a href={pdf || paper.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open</a>
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <div className="rounded-2xl border border-border overflow-hidden bg-muted/20 h-[80vh]">
            {pdf ? (
              <PdfViewer src={pdf} onText={(t) => setWordCount(t.split(/\s+/).filter(Boolean).length)}
                onQuote={(quote, pg) => {
                  const next = `${paper.notes ? paper.notes + "\n\n" : ""}> ${quote} (p. ${pg})`;
                  update.mutate({ id: paper.id, patch: { notes: next } });
                  setNotesKey((k) => k + 1);
                }} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  This paper has no open PDF. Read it on the publisher's site and keep notes here.
                </p>
                <Button asChild className="rounded-xl"><a href={paper.url} target="_blank" rel="noreferrer">Open article</a></Button>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:h-[80vh] lg:overflow-y-auto">
            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">My notes{wordCount > 0 && <span className="normal-case tracking-normal font-normal"> · {wordCount.toLocaleString()} words extracted</span>}</h2>
              <Textarea key={`${paper.id}-${notesKey}-${paper.notes.length}`} className="min-h-[180px] rounded-xl" placeholder="Notes save when you click away..."
                defaultValue={paper.notes}
                onBlur={(e) => e.target.value !== paper.notes && update.mutate({ id: paper.id, patch: { notes: e.target.value } })} />
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <div className="flex items-center mb-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex-1">AI summary</h2>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" disabled={summarize.isPending}
                  onClick={() => summarize.mutate(paper.id)}>
                  {summarize.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {paper.ai_summary ? "Redo" : "Generate"}
                </Button>
              </div>
              {paper.ai_summary ? (
                <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{paper.ai_summary}</ReactMarkdown></div>
              ) : (
                <p className="text-xs text-muted-foreground">{paper.abstract || "No summary yet."}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

export default PdfReaderPage;

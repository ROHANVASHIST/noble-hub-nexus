import { Link } from "react-router-dom";
import PageLayout from "@/frontend/components/layout/PageLayout";
import Seo from "@/frontend/components/Seo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSavedPapers, SavedPaper } from "@/frontend/hooks/useSavedPapers";
import { BookOpenCheck, BookOpen, Loader2, ArrowRight, Check, FileText } from "lucide-react";

const COLS = [
  { id: "to_read", label: "To Read", next: "reading", nextLabel: "Start" },
  { id: "reading", label: "Reading", next: "read", nextLabel: "Finish" },
  { id: "read", label: "Done", next: "to_read", nextLabel: "Re-read" },
];

const ReadingQueuePage = () => {
  const { papers, isLoading, update } = useSavedPapers();
  const done = papers.filter((p) => p.status === "read").length;
  const pct = papers.length ? (done / papers.length) * 100 : 0;

  const Card = ({ p, col }: { p: SavedPaper; col: (typeof COLS)[number] }) => (
    <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-3">{p.title}</p>
      <p className="text-[11px] text-muted-foreground truncate">
        {(p.authors || []).slice(0, 2).join(", ")}{p.year ? ` · ${p.year}` : ""}
      </p>
      <div className="flex gap-1 pt-1">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" asChild>
          <Link to={`/reader/${p.id}`}><FileText className="h-3 w-3" /> Read</Link>
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1"
          onClick={() => update.mutate({ id: p.id, patch: { status: col.next } })}>
          {col.id === "reading" ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />} {col.nextLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <Seo title="Reading List | Nobel Hub" description="Your saved papers organised into a reading queue." />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpenCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">Reading List</h1>
            <p className="text-sm text-muted-foreground">{done} of {papers.length} papers read</p>
          </div>
        </div>
        <Progress value={pct} className="h-2 mb-8" />

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Your reading list is empty</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Save papers from the Resources Hub search.</p>
            <Button asChild className="rounded-xl"><Link to="/resources">Find papers</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {COLS.map((col) => {
              const items = papers.filter((p) => p.status === col.id);
              return (
                <div key={col.id} className="rounded-2xl border border-border bg-muted/10 p-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                    {col.label} · {items.length}
                  </h2>
                  <div className="space-y-2">
                    {items.map((p) => <Card key={p.id} p={p} col={col} />)}
                    {items.length === 0 && <p className="text-xs text-muted-foreground px-1 py-4">Nothing here.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ReadingQueuePage;

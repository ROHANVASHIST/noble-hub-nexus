import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/frontend/components/layout/PageLayout";
import Seo from "@/frontend/components/Seo";
import { Button } from "@/components/ui/button";
import { useSavedPapers } from "@/frontend/hooks/useSavedPapers";
import { Sparkles, Loader2, RefreshCw, FileText, BookOpen } from "lucide-react";

const AISummariesPage = () => {
  const { papers, isLoading, summarize } = useSavedPapers();
  const [filter, setFilter] = useState<"all" | "done" | "pending">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const list = papers.filter((p) =>
    filter === "all" ? true : filter === "done" ? !!p.ai_summary : !p.ai_summary,
  );

  const run = (id: string) => {
    setBusy(id);
    summarize.mutate(id, { onSettled: () => setBusy(null) });
  };

  return (
    <PageLayout>
      <Seo title="AI Summaries | Nobel Hub" description="AI-generated summaries of your saved research papers." />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">AI Summaries</h1>
            <p className="text-sm text-muted-foreground">
              {papers.filter((p) => p.ai_summary).length} of {papers.length} saved papers summarised
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "done", "pending"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                filter === f ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}>
              {f === "done" ? "Summarised" : f === "pending" ? "Not yet" : "All"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">No saved papers yet</h3>
            <Button asChild className="rounded-xl mt-4"><Link to="/resources">Find papers</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl border border-border bg-card/50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground leading-snug">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {(p.authors || []).slice(0, 3).join(", ")}{p.year ? ` · ${p.year}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1 h-8" asChild>
                    <Link to={`/reader/${p.id}`}><FileText className="h-3.5 w-3.5" /> Read</Link>
                  </Button>
                  <Button size="sm" variant={p.ai_summary ? "outline" : "default"} className="gap-1 h-8 rounded-lg"
                    disabled={busy === p.id} onClick={() => run(p.id)}>
                    {busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : p.ai_summary ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {p.ai_summary ? "Redo" : "Summarise"}
                  </Button>
                </div>
                {p.ai_summary && (
                  <div className="prose prose-sm prose-invert max-w-none mt-4 pt-4 border-t border-border">
                    <ReactMarkdown>{p.ai_summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AISummariesPage;

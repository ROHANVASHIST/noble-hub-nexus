import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSavedPapers } from "@/frontend/hooks/useSavedPapers";
import { Library, Sparkles, FileText, BookOpenCheck, AlarmClock } from "lucide-react";

const SavedPapersWidget = () => {
  const { papers } = useSavedPapers();
  const reading = papers.filter((p) => p.status === "reading");
  const recent = (reading.length ? reading : papers).slice(0, 4);
  const stat = (n: number, l: string) => (
    <div className="text-center"><div className="text-2xl font-display font-bold text-foreground">{n}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div></div>
  );

  return (
    <div className="bg-card border border-border/50 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Library className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold flex-1">My Papers</h2>
        <Button size="sm" variant="ghost" asChild><Link to="/library">View all</Link></Button>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {stat(papers.length, "Saved")}
        {stat(papers.filter((p) => p.status === "to_read").length, "To read")}
        {stat(reading.length, "Reading")}
        {stat(papers.filter((p) => p.ai_summary).length, "Summarised")}
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">No saved papers yet — search the Resources Hub and tap Save.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {recent.map((p) => (
            <Link key={p.id} to={`/reader/${p.id}`} className="block p-3 rounded-xl border border-border hover:border-primary/40 transition-all">
              <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">{p.status.replace("_", " ")}{p.year ? ` · ${p.year}` : ""}</p>
            </Link>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button size="sm" variant="outline" className="gap-1 rounded-lg" asChild><Link to="/reading-list"><BookOpenCheck className="h-3.5 w-3.5" /> Reading list</Link></Button>
        <Button size="sm" variant="outline" className="gap-1 rounded-lg" asChild><Link to="/summaries"><Sparkles className="h-3.5 w-3.5" /> Summaries</Link></Button>
        <Button size="sm" variant="outline" className="gap-1 rounded-lg" asChild><Link to="/reader"><FileText className="h-3.5 w-3.5" /> Reader</Link></Button>
        <Button size="sm" variant="outline" className="gap-1 rounded-lg" asChild><Link to="/research-alerts"><AlarmClock className="h-3.5 w-3.5" /> Alerts</Link></Button>
      </div>
    </div>
  );
};

export default SavedPapersWidget;

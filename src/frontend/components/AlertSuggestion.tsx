import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radar, X } from "lucide-react";
import { useAuth } from "@/App";

type Suggestion = { topic: string; paper: { id: string; title: string; url?: string }; at: number };

export default function AlertSuggestion() {
  const { user } = useAuth();
  const [s, setS] = useState<Suggestion | null>(null);
  useEffect(() => {
    if (!user) return;
    const key = `alert-suggestion-${user.id}`;
    const load = () => { try { setS(JSON.parse(localStorage.getItem(key) || "null")); } catch { setS(null); } };
    load();
    window.addEventListener("alert-suggestion", load);
    return () => window.removeEventListener("alert-suggestion", load);
  }, [user]);
  if (!s || !user) return null;
  return (
    <div className="mx-2 my-2 p-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 relative">
      <button aria-label="Dismiss suggestion" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        onClick={() => { localStorage.removeItem(`alert-suggestion-${user.id}`); setS(null); }}>
        <X className="h-3 w-3" />
      </button>
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-primary"><Radar className="h-3 w-3" /> New on "{s.topic}"</p>
      {s.paper.url ? (
        <a href={s.paper.url} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-sidebar-foreground line-clamp-3 hover:underline">{s.paper.title}</a>
      ) : <p className="mt-1 text-xs text-sidebar-foreground line-clamp-3">{s.paper.title}</p>}
      <Link to="/research-alerts" className="text-[10px] text-muted-foreground hover:text-foreground">See all alerts →</Link>
    </div>
  );
}

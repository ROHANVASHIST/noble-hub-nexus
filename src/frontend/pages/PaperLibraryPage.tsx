import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Library, ExternalLink, FileDown, Trash2, Loader2, Search, Quote, StickyNote } from "lucide-react";
import { toast } from "sonner";
import Seo from "@/frontend/components/Seo";

type SavedPaper = {
  id: string;
  external_id: string;
  source: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  url: string;
  pdf_url: string | null;
  doi: string | null;
  venue: string | null;
  citations: number | null;
  status: string;
  notes: string;
};

const STATUSES = [
  { id: "to_read", label: "To Read" },
  { id: "reading", label: "Reading" },
  { id: "read", label: "Read" },
];

const citation = (p: SavedPaper) => {
  const authors = p.authors?.length
    ? p.authors.length > 3
      ? `${p.authors.slice(0, 3).join(", ")} et al.`
      : p.authors.join(", ")
    : "Unknown";
  const doi = p.doi ? `https://doi.org/${p.doi}` : p.url;
  return `${authors} ${p.year ? `(${p.year})` : ""}. ${p.title}. ${p.venue ? `${p.venue}.` : ""} ${doi}`
    .replace(/\s+/g, " ")
    .trim();
};

const PaperLibraryPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [openNotes, setOpenNotes] = useState<string | null>(null);

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ["saved-papers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_papers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SavedPaper[];
    },
    enabled: !!user,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SavedPaper> }) => {
      const { error } = await supabase.from("saved_papers").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-papers"] }),
    onError: () => toast.error("Could not update"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_papers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-papers"] });
      toast.success("Removed from library");
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return papers.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (!term ||
          p.title.toLowerCase().includes(term) ||
          (p.authors || []).join(" ").toLowerCase().includes(term) ||
          (p.venue || "").toLowerCase().includes(term)),
    );
  }, [papers, q, status]);

  const exportBibtex = () => {
    const bib = filtered
      .map((p, i) => {
        const key = `${(p.authors?.[0] || "anon").split(" ").pop()}${p.year || ""}${i}`.replace(/\W/g, "");
        return `@article{${key},\n  title={${p.title}},\n  author={${(p.authors || []).join(" and ")}},\n  year={${p.year || ""}},\n  journal={${p.venue || ""}},\n  doi={${p.doi || ""}},\n  url={${p.url}}\n}`;
      })
      .join("\n\n");
    const blob = new Blob([bib], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "library.bib";
    a.click();
    toast.success("BibTeX exported");
  };

  return (
    <PageLayout>
      <Seo
        title="My Paper Library | Nobel Hub"
        description="Your saved research papers with reading status, notes and citation export."
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-foreground">My Paper Library</h1>
              <p className="text-sm text-muted-foreground">
                {papers.length} saved {papers.length === 1 ? "paper" : "papers"} · notes, status and citations.
              </p>
            </div>
            {filtered.length > 0 && (
              <Button variant="outline" className="rounded-xl gap-1" onClick={exportBibtex}>
                <FileDown className="h-4 w-4" /> BibTeX
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 rounded-xl"
                placeholder="Search your library..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[{ id: "all", label: "All" }, ...STATUSES].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    status === s.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border">
              <Library className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground">Nothing here yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Save papers from the Resources Hub search to build your library.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground leading-snug">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {(p.authors || []).slice(0, 4).join(", ")}
                        {p.year ? ` · ${p.year}` : ""}
                        {p.venue ? ` · ${p.venue}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {p.source}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {STATUSES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => update.mutate({ id: p.id, patch: { status: s.id } })}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                          p.status === s.id
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {p.url && (
                      <Button size="sm" variant="ghost" className="gap-1 h-8" asChild>
                        <a href={p.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> Open
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 h-8"
                      onClick={() => {
                        navigator.clipboard.writeText(citation(p));
                        toast.success("Citation copied");
                      }}
                    >
                      <Quote className="h-3.5 w-3.5" /> Cite
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 h-8"
                      onClick={() => setOpenNotes(openNotes === p.id ? null : p.id)}
                    >
                      <StickyNote className="h-3.5 w-3.5" /> Notes
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive"
                      onClick={() => remove.mutate(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {openNotes === p.id && (
                    <Textarea
                      className="mt-3 rounded-xl"
                      placeholder="Your notes on this paper..."
                      defaultValue={p.notes}
                      onBlur={(e) => update.mutate({ id: p.id, patch: { notes: e.target.value } })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PaperLibraryPage;

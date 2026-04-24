import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Save,
  FileDown,
  FileText,
  Trash2,
  Plus,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { PaperFormat } from "./paperFormats";
import { exportPaperToDocx, exportPaperToPdf } from "./paperExport";

interface Draft {
  id: string;
  title: string;
  values: Record<string, string>;
  updatedAt: string;
}

interface PaperFormatEditorProps {
  format: PaperFormat;
}

const emptyValues = (format: PaperFormat) =>
  Object.fromEntries(format.sections.map((s) => [s.key, ""])) as Record<
    string,
    string
  >;

const PaperFormatEditor = ({ format }: PaperFormatEditorProps) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [paperTitle, setPaperTitle] = useState("Untitled " + format.name);
  const [values, setValues] = useState<Record<string, string>>(
    emptyValues(format)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => {
    const total = format.sections.length;
    const filled = format.sections.filter(
      (s) => (values[s.key] ?? "").trim().length > 0
    ).length;
    return Math.round((filled / total) * 100);
  }, [values, format]);

  const loadDrafts = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from("scholar_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", format.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      const parsed: Draft[] = data.map((row: any) => {
        let parsedValues: Record<string, string> = emptyValues(format);
        try {
          const obj = JSON.parse(row.content);
          if (obj && typeof obj === "object" && obj.values) {
            parsedValues = { ...emptyValues(format), ...obj.values };
          }
        } catch {
          // legacy plain content
        }
        return {
          id: row.id,
          title: row.title,
          values: parsedValues,
          updatedAt: row.created_at,
        };
      });
      setDrafts(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format.id]);

  const startNew = () => {
    setActiveId(null);
    setPaperTitle("Untitled " + format.name);
    setValues(emptyValues(format));
  };

  const openDraft = (draft: Draft) => {
    setActiveId(draft.id);
    setPaperTitle(draft.title);
    setValues({ ...emptyValues(format), ...draft.values });
  };

  const saveDraft = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save drafts");
      setSaving(false);
      return;
    }
    const payload = {
      title: paperTitle.trim() || "Untitled " + format.name,
      content: JSON.stringify({ values }),
      type: format.id,
    };
    if (activeId) {
      const { error } = await (supabase as any)
        .from("scholar_notes")
        .update({ title: payload.title, content: payload.content })
        .eq("id", activeId);
      if (error) {
        toast.error("Failed to save draft");
      } else {
        toast.success("Draft updated");
        await loadDrafts();
      }
    } else {
      const { data, error } = await (supabase as any)
        .from("scholar_notes")
        .insert({ user_id: user.id, ...payload })
        .select()
        .single();
      if (error) {
        toast.error("Failed to save draft");
      } else {
        toast.success("Draft saved");
        setActiveId(data.id);
        await loadDrafts();
      }
    }
    setSaving(false);
  };

  const deleteDraft = async (id: string) => {
    if (!confirm("Delete this draft?")) return;
    const { error } = await (supabase as any)
      .from("scholar_notes")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Draft deleted");
    if (activeId === id) startNew();
    await loadDrafts();
  };

  const handleExportDocx = async () => {
    try {
      await exportPaperToDocx(format, values, paperTitle);
      toast.success("DOCX downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export DOCX");
    }
  };

  const handleExportPdf = () => {
    exportPaperToPdf(format, values, paperTitle);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar — drafts */}
      <aside className="space-y-4">
        <Card className="p-4 bg-card border-border/50 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              My Drafts
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-primary"
              onClick={startNew}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : drafts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-4">
              No drafts yet. Fill the form and hit Save.
            </p>
          ) : (
            <ul className="space-y-1">
              {drafts.map((d) => (
                <li
                  key={d.id}
                  className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 cursor-pointer transition-colors ${
                    activeId === d.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => openDraft(d)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">
                      {d.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete draft"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDraft(d.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 bg-primary/5 border-primary/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Completion
            </span>
          </div>
          <div className="text-2xl font-display font-bold tabular-nums">
            {completion}%
          </div>
          <Progress value={completion} className="h-2" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {format.sections.length} sections · fill each to reach 100%.
          </p>
        </Card>
      </aside>

      {/* Editor */}
      <div className="space-y-6">
        <Card className="p-6 bg-card border-border/50 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Working title
              </label>
              <Input
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="Working title"
                className="mt-1 text-lg font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={saveDraft}
                disabled={saving}
                className="rounded-xl"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {activeId ? "Update Draft" : "Save Draft"}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPdf}
                className="rounded-xl"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleExportDocx}
                className="rounded-xl"
              >
                <FileDown className="h-4 w-4 mr-2" />
                DOCX
              </Button>
            </div>
          </div>
        </Card>

        {format.sections.map((section, idx) => {
          const value = values[section.key] ?? "";
          const filled = value.trim().length > 0;
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card className="p-6 bg-card border-border/50 rounded-2xl">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      {section.title}
                      {filled && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
                <Textarea
                  value={value}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [section.key]: e.target.value,
                    }))
                  }
                  placeholder={section.placeholder}
                  rows={section.minRows}
                  className="mt-3 resize-y bg-background/50 font-mono text-sm leading-relaxed"
                />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PaperFormatEditor;

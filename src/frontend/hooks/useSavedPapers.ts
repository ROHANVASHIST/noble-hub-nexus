import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { toast } from "sonner";

export type SavedPaper = {
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
  ai_summary: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export function useSavedPapers() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["saved-papers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_papers").select("*").order("created_at", { ascending: false });
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
    onError: () => toast.error("Could not update paper"),
  });

  const summarize = useMutation({
    mutationFn: async (paperId: string) => {
      const { data, error } = await supabase.functions.invoke("paper-summary", { body: { paperId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.summary as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-papers"] });
      toast.success("AI summary ready");
    },
    onError: (e: Error) => toast.error(e.message || "Could not summarise"),
  });

  return { papers: query.data || [], isLoading: query.isLoading, update, summarize };
}

CREATE TABLE public.saved_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  title text NOT NULL,
  authors text[] NOT NULL DEFAULT '{}',
  year integer,
  abstract text DEFAULT '',
  url text NOT NULL DEFAULT '',
  pdf_url text,
  doi text,
  venue text,
  citations integer,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'to_read',
  notes text NOT NULL DEFAULT '',
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, external_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_papers TO authenticated;
GRANT ALL ON public.saved_papers TO service_role;
ALTER TABLE public.saved_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved papers" ON public.saved_papers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved papers" ON public.saved_papers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved papers" ON public.saved_papers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved papers" ON public.saved_papers FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_papers_updated_at BEFORE UPDATE ON public.saved_papers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.research_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  sources text[] NOT NULL DEFAULT '{arxiv,semantic_scholar,openalex,crossref,pubmed,doaj}',
  is_active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  seen_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_alerts TO authenticated;
GRANT ALL ON public.research_alerts TO service_role;
ALTER TABLE public.research_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.research_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.research_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.research_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.research_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_research_alerts_updated_at BEFORE UPDATE ON public.research_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_saved_papers_user ON public.saved_papers(user_id, created_at DESC);
CREATE INDEX idx_research_alerts_user ON public.research_alerts(user_id);
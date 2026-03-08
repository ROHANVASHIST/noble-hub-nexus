CREATE TABLE public.annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id text NOT NULL,
  item_type text NOT NULL DEFAULT 'laureate',
  selected_text text NOT NULL,
  note text DEFAULT '',
  color text NOT NULL DEFAULT '#fbbf24',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own annotations" ON public.annotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own annotations" ON public.annotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own annotations" ON public.annotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own annotations" ON public.annotations FOR DELETE USING (auth.uid() = user_id);
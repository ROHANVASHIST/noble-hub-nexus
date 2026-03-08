CREATE TABLE public.scratchpad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  color text NOT NULL DEFAULT '#fbbf24',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scratchpad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scratchpad" ON public.scratchpad FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scratchpad" ON public.scratchpad FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scratchpad" ON public.scratchpad FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scratchpad" ON public.scratchpad FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  due_date timestamptz NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);
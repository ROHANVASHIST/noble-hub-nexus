
CREATE TABLE public.mentor_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mentor_name text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON public.mentor_chat_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.mentor_chat_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.mentor_chat_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.mentor_chat_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

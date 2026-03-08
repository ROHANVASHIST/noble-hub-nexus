
CREATE TABLE public.user_trackers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tracker_name TEXT NOT NULL,
  tracker_type TEXT NOT NULL DEFAULT 'quantity',
  unit TEXT NOT NULL DEFAULT '',
  entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trackers" ON public.user_trackers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trackers" ON public.user_trackers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trackers" ON public.user_trackers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trackers" ON public.user_trackers FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

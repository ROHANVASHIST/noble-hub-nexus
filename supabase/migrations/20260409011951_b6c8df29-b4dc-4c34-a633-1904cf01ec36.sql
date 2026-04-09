
-- Fix: Scope profiles policies to authenticated role only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix: Scope bookmarks policies to authenticated role
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Scope user_activity policies to authenticated role
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity;

CREATE POLICY "Users can view own activity" ON public.user_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.user_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix: Scope annotations policies to authenticated role
DROP POLICY IF EXISTS "Users can view own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can insert own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can update own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can delete own annotations" ON public.annotations;

CREATE POLICY "Users can view own annotations" ON public.annotations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own annotations" ON public.annotations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own annotations" ON public.annotations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own annotations" ON public.annotations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Scope scratchpad policies to authenticated role
DROP POLICY IF EXISTS "Users can view own scratchpad" ON public.scratchpad;
DROP POLICY IF EXISTS "Users can insert own scratchpad" ON public.scratchpad;
DROP POLICY IF EXISTS "Users can update own scratchpad" ON public.scratchpad;
DROP POLICY IF EXISTS "Users can delete own scratchpad" ON public.scratchpad;

CREATE POLICY "Users can view own scratchpad" ON public.scratchpad FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scratchpad" ON public.scratchpad FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scratchpad" ON public.scratchpad FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scratchpad" ON public.scratchpad FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Scope notifications policies to authenticated role
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix: Scope reminders policies to authenticated role
DROP POLICY IF EXISTS "Users can view own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON public.reminders;

CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Scope user_trackers policies to authenticated role
DROP POLICY IF EXISTS "Users can view own trackers" ON public.user_trackers;
DROP POLICY IF EXISTS "Users can insert own trackers" ON public.user_trackers;
DROP POLICY IF EXISTS "Users can update own trackers" ON public.user_trackers;
DROP POLICY IF EXISTS "Users can delete own trackers" ON public.user_trackers;

CREATE POLICY "Users can view own trackers" ON public.user_trackers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trackers" ON public.user_trackers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trackers" ON public.user_trackers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trackers" ON public.user_trackers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Scope scholar_notes policies to authenticated role
DROP POLICY IF EXISTS "Users can view own notes" ON public.scholar_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.scholar_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.scholar_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.scholar_notes;

CREATE POLICY "Users can view own notes" ON public.scholar_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.scholar_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.scholar_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.scholar_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix: Scope research_projects policies to authenticated role
DROP POLICY IF EXISTS "Users can view own projects" ON public.research_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.research_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.research_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.research_projects;

CREATE POLICY "Users can view own projects" ON public.research_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.research_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.research_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.research_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
